const OLLAMA_URL = "http://localhost:11434";

interface ConversationMessage {
  role: "USER" | "ASSISTANT";
  content: string;
}

interface OllamaResponse {
  model: string;
  response: string;
  done: boolean;
}

export async function generateAIResponse(
  messages: ConversationMessage[]
): Promise<{ content: string; model: string }> {
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
        stream: false,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Ollama request failed with status ${response.status}`
    );
  }

  const data =
    (await response.json()) as OllamaResponse;

  return {
    content: data.response,
    model: data.model,
  };
}