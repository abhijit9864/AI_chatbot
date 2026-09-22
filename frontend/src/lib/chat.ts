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

export async function sendMessage(
  chatId: string,
  content: string
): Promise<{
  message: {
    userMessage: Message;
    assistantMessage: Message;
  };
}> {
  return apiRequest<{
    message: {
      userMessage: Message;
      assistantMessage: Message;
    };
  }>(`/chats/${chatId}/messages`, {
    method: "POST",
    body: JSON.stringify({
      content,
    }),
  });
}