import api from "../axios";
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
} from "../types/api";
import { UserService } from "./user.service";

export class AuthService {
  static async login(data: LoginRequest): Promise<AuthResponse> {
    console.log("Login request payload:", data);
    try {
      const response = await api.post<AuthResponse>("/auth/login", data);
      console.log("Login response:", response.data);
      localStorage.setItem("token", response.data.token);
      return response.data;
    } catch (error) {
      console.error("Login API error:", error);
      throw error;
    }
  }

  static async register(data: RegisterRequest): Promise<AuthResponse> {
    console.log("Register API URL:", api.defaults.baseURL + "/auth/register");
    console.log("Register request payload:", JSON.stringify(data));
    try {
      const response = await api.post<AuthResponse>("/auth/register", data);
      console.log("Register response:", response.data);
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
      try {
        await api.post("/auth/logout", null, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Logout successful");
      } catch (error) {
        console.error("Logout API error:", error);
      } finally {
        localStorage.removeItem("token");
      }
    }
  }

  static isAuthenticated(): boolean {
    const token = localStorage.getItem("token");
    console.log("Checking if authenticated, token exists:", !!token);
    return !!token;
  }

  static async getCurrentUser(): Promise<User> {
    console.log("Getting current user profile");
    try {
      return await UserService.getProfile();
    } catch (error) {
      console.error("Error getting current user:", error);
      throw error;
    }
  }
}
