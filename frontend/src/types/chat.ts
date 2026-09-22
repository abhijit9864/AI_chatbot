export type MessageRole = "USER" | "ASSISTANT";

export interface Message {
  id: string;
  chatId: string;
  role: MessageRole;
  content: string;
  createdAt: string;
  updatedAt?: string;

  // Temporary frontend-only field for testing response time.
  // Remove later if you don't want timing.
  responseTimeMs?: number;
}

export interface Chat {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}