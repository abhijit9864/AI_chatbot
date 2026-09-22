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
  onChunk: (chunk: string) => void
): Promise<{
  content: string;
  model: string;
}> {
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

Conversation:
${conversation}

Assistant:`;

  const response = await fetch(
    `${OLLAMA_URL}/api/generate`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "qwen3:4b",
        prompt,
        stream: true,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Ollama request failed with status ${response.status}`
    );
  }

  if (!response.body) {
    throw new Error("Ollama response body is empty");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  let fullContent = "";
  let model = "qwen3:4b";

  while (true) {
    const { value, done } =
      await reader.read();

    if (done) {
      break;
    }

    const text = decoder.decode(value, {
      stream: true,
    });

    const lines = text
      .split("\n")
      .filter(Boolean);

    for (const line of lines) {
      try {
        const data =
          JSON.parse(line) as OllamaStreamChunk;

        if (data.response) {
          fullContent += data.response;

          onChunk(data.response);
        }

        if (data.model) {
          model = data.model;
        }
      } catch (error) {
        console.error(
          "Failed to parse Ollama stream chunk:",
          error
        );
      }
    }
  }

  return {
    content: fullContent,
    model,
  };
}