import api from "../axios";
import { AuthResponse, LoginRequest, RegisterRequest } from "../types/api";

export class AuthService {
  static async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/auth/login", data);
    localStorage.setItem("token", response.data.token);
    return response.data;
  }

  static async register(data: RegisterRequest): Promise<AuthResponse> {
    console.log("Register API URL:", api.defaults.baseURL + "/auth/register");
    console.log("Register request payload:", JSON.stringify(data));
    try {
      const response = await api.post<AuthResponse>("/auth/register", data);
      localStorage.setItem("token", response.data.token);
      return response.data;
    } catch (error) {
      console.error("Register API error:", error);
      throw error;
    }
  }

  static async logout(): Promise<void> {
    const token = localStorage.getItem("token");
    if (token) {
      await api.post("/auth/logout", null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      localStorage.removeItem("token");
    }
  }

  static isAuthenticated(): boolean {
    return !!localStorage.getItem("token");
  }
}
