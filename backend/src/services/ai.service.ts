import { log } from "node:console";

const OLLAMA_URL = "http://localhost:11434";

interface OllamaResponse {
  model: string;
  response: string;
  done: boolean;
}

export async function generateAIResponse(
  message: string
): Promise<{
  content: string;
  model: string;
}> {
  const response = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "qwen3:4b",
      prompt: message,
      stream: false,
    }),
  });

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

