const OLLAMA_URL = "http://localhost:11434";

interface ConversationMessage {
  role: "USER" | "ASSISTANT";
  content: string;
}

interface OllamaStreamChunk {
  model: string;
  response: string;
  done: boolean;
}

export async function streamAIResponse(
  messages: ConversationMessage[],
  onChunk: (chunk: string) => void,
  signal?: AbortSignal
): Promise<{
  content: string;
  model: string;
}> {
  const startTime = performance.now();

  console.log("[AI] Stream request started");

  const conversation = messages
    .map((message) => {
      const role =
        message.role === "USER"
          ? "User"
          : "Assistant";

      return `${role}: ${message.content}`;
    })
    .join("\n\n");

  const prompt = `You are a helpful AI assistant.

Rules:
- Answer the user's question directly.
- Be concise unless the user asks for detail.
- Follow the user's requested length or format.
- Do not unnecessarily repeat information.
- Do not reveal internal reasoning or thinking.
- Return only the final answer.
- Do not include <think> or </think> tags.

/no_think

Conversation:
${conversation}

Assistant:`;

  console.log("[AI] Sending request to Ollama...");

  const ollamaRequestStart =
    performance.now();

  const response = await fetch(
    `${OLLAMA_URL}/api/generate`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      signal,
      body: JSON.stringify({
        model: "qwen3:4b-instruct",
        prompt,
        stream: true,
        think: false,
      }),
    },
  );

  const ollamaResponseTime =
    performance.now() -
    ollamaRequestStart;

  console.log(
    `[AI] Ollama response received in ${ollamaResponseTime.toFixed(
      2,
    )} ms`,
  );

  if (!response.ok) {
    throw new Error(
      `Ollama request failed with status ${response.status}`,
    );
  }

  if (!response.body) {
    throw new Error(
      "Ollama response body is empty",
    );
  }

  const reader =
    response.body.getReader();

  const decoder =
    new TextDecoder();

  let buffer = "";
  let fullContent = "";
  let model = "qwen3:4b";

  let firstChunkReceived = false;

  /*
   * Thinking filter
   *
   * We support both:
   *
   * <think>
   * hidden reasoning
   * </think>
   * final answer
   *
   * and responses where only </think>
   * is returned.
   */
  let thinking = false;
  let sawThinkTag = false;
  let hiddenThinkingBuffer = "";

  const processText = (text: string) => {
    if (!text) {
      return;
    }

    /*
     * If we are already inside a <think> block,
     * keep collecting until </think>.
     */
    if (thinking) {
      const thinkEnd =
        text.indexOf("</think>");

      if (thinkEnd === -1) {
        hiddenThinkingBuffer += text;
        return;
      }

      thinking = false;

      const afterThink =
        text.slice(
          thinkEnd + "</think>".length,
        );

      hiddenThinkingBuffer = "";

      if (afterThink) {
        fullContent += afterThink;
        onChunk(afterThink);
      }

      return;
    }

    /*
     * Detect <think> in the current chunk.
     */
    const thinkStart =
      text.indexOf("<think>");

    if (thinkStart !== -1) {
      sawThinkTag = true;

      const beforeThink =
        text.slice(0, thinkStart);

      if (beforeThink) {
        fullContent += beforeThink;
        onChunk(beforeThink);
      }

      const afterThinkStart =
        text.slice(
          thinkStart + "<think>".length,
        );

      const thinkEnd =
        afterThinkStart.indexOf(
          "</think>",
        );

      if (thinkEnd !== -1) {
        const finalAnswer =
          afterThinkStart.slice(
            thinkEnd + "</think>".length,
          );

        if (finalAnswer) {
          fullContent += finalAnswer;
          onChunk(finalAnswer);
        }

        thinking = false;
        return;
      }

      thinking = true;
      hiddenThinkingBuffer =
        afterThinkStart;

      return;
    }

    /*
     * Some Qwen responses may omit <think>
     * and only return </think>.
     *
     * In that case, discard everything before
     * </think> and emit everything after it.
     */
    const thinkEnd =
      text.indexOf("</think>");

    if (thinkEnd !== -1) {
      sawThinkTag = true;

      const finalAnswer =
        text.slice(
          thinkEnd + "</think>".length,
        );

      if (finalAnswer) {
        fullContent += finalAnswer;
        onChunk(finalAnswer);
      }

      return;
    }

    /*
     * Normal response.
     *
     * If no thinking tag exists, stream normally.
     */
    fullContent += text;
    onChunk(text);
  };

  while (true) {
    const { value, done } =
      await reader.read();

    if (done) {
      break;
    }

    buffer += decoder.decode(
      value,
      {
        stream: true,
      },
    );

    const lines =
      buffer.split("\n");

    buffer =
      lines.pop() || "";

    for (const line of lines) {
      const trimmedLine =
        line.trim();

      if (!trimmedLine) {
        continue;
      }

      try {
        const data =
          JSON.parse(
            trimmedLine,
          ) as OllamaStreamChunk;

        if (data.response) {
          if (
            !firstChunkReceived
          ) {
            firstChunkReceived =
              true;

            const firstChunkTime =
              performance.now() -
              startTime;

            console.log(
              `[AI] First chunk received after ${firstChunkTime.toFixed(
                2,
              )} ms:`,
              data.response,
            );
          }

          processText(
            data.response,
          );
        }

        if (data.model) {
          model =
            data.model;
        }

        if (data.done) {
          console.log(
            "[AI] Ollama reported generation complete",
          );
        }
      } catch (error) {
        console.error(
          "[AI] Failed to parse Ollama stream chunk:",
          error,
        );
      }
    }
  }

  /*
   * Process final incomplete JSON line.
   */
  const remainingLine =
    buffer.trim();

  if (remainingLine) {
    try {
      const data =
        JSON.parse(
          remainingLine,
        ) as OllamaStreamChunk;

      if (data.response) {
        processText(
          data.response,
        );
      }

      if (data.model) {
        model =
          data.model;
      }

      if (data.done) {
        console.log(
          "[AI] Final buffered chunk processed",
        );
      }
    } catch (error) {
      console.error(
        "[AI] Failed to parse final Ollama chunk:",
        error,
      );
    }
  }

  /*
   * Flush TextDecoder.
   */
  const finalText =
    decoder.decode();

  if (finalText) {
    processText(finalText);
  }

  /*
   * If Ollama returned thinking without a
   * closing tag, do NOT expose it.
   */
  if (thinking) {
    console.warn(
      "[AI] Thinking block did not close. Hidden content was discarded.",
    );
  }

  const totalTime =
    performance.now() -
    startTime;

  console.log(
    `[AI] Stream completed in ${(
      totalTime / 1000
    ).toFixed(
      2,
    )} seconds. Characters: ${
      fullContent.length
    }`,
  );

  console.log(
    `[AI] Think tag detected: ${sawThinkTag}`,
  );

  return {
    content: fullContent.trim(),
    model,
  };
}