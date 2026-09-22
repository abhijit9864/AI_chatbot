import { apiRequest } from "./api";
import { User } from "@/types/user";
import { Chat } from "@/types/chat";

export async function getUsers(): Promise<User[]> {
  return apiRequest<User[]>("/admin/users");
}

export async function getAllChats(): Promise<Chat[]> {
  return apiRequest<Chat[]>("/admin/chats");
}

export async function getAdminStats() {
  return apiRequest("/admin/stats");
}

export async function disableUser(userId: string) {
  return apiRequest(`/admin/users/${userId}/disable`, {
    method: "PATCH",
  });
}