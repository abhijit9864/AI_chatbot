import { apiRequest } from "./api";
import { Chat, Message } from "@/types/chat";

export async function getChats(): Promise<{
  chats: Chat[];
}> {
  return apiRequest<{ chats: Chat[] }>("/chats");
}

export async function getChat(chatId: string): Promise<{
  chat: Chat;
}> {
  return apiRequest<{ chat: Chat }>(`/chats/${chatId}`);
}

export async function createChat(): Promise<{
  chat: Chat;
}> {
  return apiRequest<{ chat: Chat }>("/chats", {
    method: "POST",
  });
}

export async function renameChat(
  chatId: string,
  title: string
): Promise<{
  chat: Chat;
}> {
  return apiRequest<{ chat: Chat }>(`/chats/${chatId}`, {
    method: "PATCH",
    body: JSON.stringify({ title }),
  });
}

export async function deleteChat(
  chatId: string
): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/chats/${chatId}`, {
    method: "DELETE",
  });
}

export async function getChatMessages(
  chatId: string
): Promise<{
  messages: Message[];
}> {
  return apiRequest<{ messages: Message[] }>(
    `/chats/${chatId}/messages`
  );
}

export async function sendMessageStream(
  chatId: string,
  content: string,
  onChunk: (chunk: string) => void
): Promise<{
  userMessage: Message;
  assistantMessage: Message;
}> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  if (!API_URL) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is not configured"
    );
  }

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  if (!token) {
    throw new Error("Authentication required");
  }

  const response = await fetch(
    `${API_URL}/chats/${chatId}/messages`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      errorText ||
        `Request failed with status ${response.status}`
    );
  }

  if (!response.body) {
    throw new Error(
      "Streaming response body is empty"
    );
  }

  const reader =
    response.body.getReader();

  const decoder = new TextDecoder();

  let buffer = "";

  let userMessage: Message | null =
    null;

  let assistantMessage: Message | null =
    null;

  while (true) {
    const { value, done } =
      await reader.read();

    if (done) {
      break;
    }

    buffer += decoder.decode(value, {
      stream: true,
    });

    const events = buffer.split("\n\n");

    buffer = events.pop() || "";

    for (const event of events) {
      const line = event
        .split("\n")
        .find((line) =>
          line.startsWith("data:")
        );

      if (!line) {
        continue;
      }

      const json = line
        .replace(/^data:\s*/, "")
        .trim();

      if (!json) {
        continue;
      }

      const data = JSON.parse(json);

      if (data.type === "chunk") {
        onChunk(data.content);
      }

      if (data.type === "done") {
        userMessage = data.userMessage;
        assistantMessage =
          data.assistantMessage;
      }

      if (data.type === "error") {
        throw new Error(
          data.message ||
            "Streaming failed"
        );
      }
    }
  }

  if (!userMessage || !assistantMessage) {
    throw new Error(
      "Streaming completed without final messages"
    );
  }

  return {
    userMessage,
    assistantMessage,
  };
}