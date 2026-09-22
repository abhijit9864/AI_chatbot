import { apiRequest } from "./api";
import { AuthResponse } from "@/types/api";

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export async function login(data: LoginData): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function register(
  data: RegisterData
): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getCurrentUser(): Promise<{
  user: {
    id: string;
    name: string;
    email: string;
    role: "USER" | "ADMIN";
  };
}> {
  return apiRequest("/auth/me");
}
