import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { AuthService } from "@/lib/services/auth.service";
import { UserService } from "@/lib/services/user.service";
import api from "@/lib/axios";
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
} from "@/lib/types/api";

// Mock dependencies
vi.mock("@/lib/axios", () => ({
  default: {
    post: vi.fn(),
    defaults: {
      baseURL: "http://test-api.com/api",
    },
  },
}));

vi.mock("@/lib/services/user.service", () => ({
  UserService: {
    getProfile: vi.fn(),
  },
}));

describe("AuthService", () => {
  // Mock data
  const mockUser: User = {
    id: "user-123",
    username: "testuser",
    email: "test@example.com",
    fullName: "Test User",
    bio: "Test bio",
    avatarUrl: "https://example.com/avatar.jpg",
  };

  const mockAuthResponse: AuthResponse = {
    token: "test-token-123",
    user: mockUser,
  };

  // Mock localStorage
  const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: vi.fn((key: string) => store[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key];
      }),
      clear: vi.fn(() => {
        store = {};
      }),
    };
  })();
  Object.defineProperty(window, "localStorage", { value: localStorageMock });

  // Mock console methods to reduce noise in test output
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;

  beforeEach(() => {
    vi.resetAllMocks();
    localStorageMock.clear();

    // Silence console logs and errors during tests
    console.log = vi.fn();
    console.error = vi.fn();
  });

  afterEach(() => {
    // Restore console methods
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
  });

  describe("login", () => {
    it("should login successfully and store token", async () => {
      // Mock API response
      vi.mocked(api.post).mockResolvedValueOnce({ data: mockAuthResponse });

      // Login data
      const loginData: LoginRequest = {
        usernameOrEmail: "testuser",
        password: "password123",
      };

      // Call the service method
      const result = await AuthService.login(loginData);

      // Verify API was called with correct parameters
      expect(api.post).toHaveBeenCalledWith("/auth/login", loginData);

      // Verify token was stored in localStorage
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "token",
        mockAuthResponse.token
      );

      // Verify the result
      expect(result).toEqual(mockAuthResponse);
    });

    it("should handle login errors", async () => {
      // Mock API error
      const error = new Error("Invalid credentials");
      vi.mocked(api.post).mockRejectedValueOnce(error);

      // Login data
      const loginData: LoginRequest = {
        usernameOrEmail: "testuser",
        password: "wrong-password",
      };

      // Call the service method and expect it to throw
      await expect(AuthService.login(loginData)).rejects.toThrow(
        "Invalid credentials"
      );

      // Verify API was called
      expect(api.post).toHaveBeenCalledWith("/auth/login", loginData);

      // Verify token was not stored
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });
  });

  describe("register", () => {
    it("should register successfully and store token", async () => {
      // Mock API response
      vi.mocked(api.post).mockResolvedValueOnce({ data: mockAuthResponse });

      // Register data
      const registerData: RegisterRequest = {
        username: "testuser",
        email: "test@example.com",
        password: "password123",
        fullName: "Test User",
      };

      // Call the service method
      const result = await AuthService.register(registerData);

      // Verify API was called with correct parameters
      expect(api.post).toHaveBeenCalledWith("/auth/register", registerData);

      // Verify token was stored in localStorage
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "token",
        mockAuthResponse.token
      );

      // Verify the result
      expect(result).toEqual(mockAuthResponse);
    });

    it("should handle registration errors", async () => {
      // Mock API error
      const error = new Error("Username already exists");
      vi.mocked(api.post).mockRejectedValueOnce(error);

      // Register data
      const registerData: RegisterRequest = {
        username: "existinguser",
        email: "existing@example.com",
        password: "password123",
        fullName: "Existing User",
      };

      // Call the service method and expect it to throw
      await expect(AuthService.register(registerData)).rejects.toThrow(
        "Username already exists"
      );

      // Verify API was called
      expect(api.post).toHaveBeenCalledWith("/auth/register", registerData);

      // Verify token was not stored
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });
  });

  describe("logout", () => {
    it("should logout successfully and remove token", async () => {
      // Set token in localStorage
      localStorageMock.setItem("token", "test-token-123");

      // Mock API response
      vi.mocked(api.post).mockResolvedValueOnce({ data: null });

      // Call the service method
      await AuthService.logout();

      // Verify API was called with correct parameters
      expect(api.post).toHaveBeenCalledWith("/auth/logout", null, {
        headers: { Authorization: "Bearer test-token-123" },
      });

      // Verify token was removed from localStorage
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("token");
    });

    it("should handle logout errors and still remove token", async () => {
      // Set token in localStorage
      localStorageMock.setItem("token", "test-token-123");

      // Mock API error
      const error = new Error("Network error");
      vi.mocked(api.post).mockRejectedValueOnce(error);

      // Call the service method
      await AuthService.logout();

      // Verify API was called
      expect(api.post).toHaveBeenCalledWith("/auth/logout", null, {
        headers: { Authorization: "Bearer test-token-123" },
      });

      // Verify token was still removed from localStorage despite the error
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("token");
    });

    it("should not call API if no token exists", async () => {
      // Ensure no token in localStorage
      localStorageMock.getItem.mockReturnValueOnce(null);

      // Call the service method
      await AuthService.logout();

      // Verify API was not called
      expect(api.post).not.toHaveBeenCalled();
    });
  });

  describe("isAuthenticated", () => {
    it("should return true when token exists", () => {
      // Set token in localStorage
      localStorageMock.getItem.mockReturnValueOnce("test-token-123");

      // Call the service method
      const result = AuthService.isAuthenticated();

      // Verify localStorage was checked
      expect(localStorageMock.getItem).toHaveBeenCalledWith("token");

      // Verify the result
      expect(result).toBe(true);
    });

    it("should return false when token does not exist", () => {
      // Ensure no token in localStorage
      localStorageMock.getItem.mockReturnValueOnce(null);

      // Call the service method
      const result = AuthService.isAuthenticated();

      // Verify localStorage was checked
      expect(localStorageMock.getItem).toHaveBeenCalledWith("token");

      // Verify the result
      expect(result).toBe(false);
    });
  });

  describe("getCurrentUser", () => {
    it("should fetch current user profile", async () => {
      // Mock UserService response
      vi.mocked(UserService.getProfile).mockResolvedValueOnce(mockUser);

      // Call the service method
      const result = await AuthService.getCurrentUser();

      // Verify UserService was called
      expect(UserService.getProfile).toHaveBeenCalledTimes(1);

      // Verify the result
      expect(result).toEqual(mockUser);
    });

    it("should handle errors when fetching user profile", async () => {
      // Mock UserService error
      const error = new Error("Failed to fetch user profile");
      vi.mocked(UserService.getProfile).mockRejectedValueOnce(error);

      // Call the service method and expect it to throw
      await expect(AuthService.getCurrentUser()).rejects.toThrow(
        "Failed to fetch user profile"
      );

      // Verify UserService was called
      expect(UserService.getProfile).toHaveBeenCalledTimes(1);
    });
  });
});
