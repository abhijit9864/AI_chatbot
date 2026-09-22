export interface ApiError {
  message: string;
  status?: number;
}

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: "USER" | "ADMIN";
  };
  token: string;
}