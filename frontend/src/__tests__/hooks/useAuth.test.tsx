import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useAuth } from "@/hooks/useAuth";
import { AuthService } from "@/lib/services/auth.service";
import {
  User,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
} from "@/lib/types/api";

// Mock the AuthService
vi.mock("@/lib/services/auth.service", () => ({
  AuthService: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    isAuthenticated: vi.fn(),
    getCurrentUser: vi.fn(),
  },
}));

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

// Mock user data
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

describe("useAuth hook", () => {
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

  describe("initial state", () => {
    it("should check authentication and set state accordingly when not authenticated", async () => {
      // Mock isAuthenticated to return false
      vi.mocked(AuthService.isAuthenticated).mockReturnValue(false);

      // Render the hook
      const { result } = renderHook(() => useAuth());

      // Wait for the authentication check to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // After loading, should not be authenticated
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.error).toBeNull();
      expect(AuthService.isAuthenticated).toHaveBeenCalledTimes(1);
      expect(AuthService.getCurrentUser).not.toHaveBeenCalled();
    });

    it("should initialize as authenticated when token exists", async () => {
      // Mock isAuthenticated to return true
      vi.mocked(AuthService.isAuthenticated).mockReturnValue(true);
      vi.mocked(AuthService.getCurrentUser).mockResolvedValue(mockUser);

      // Render the hook
      const { result } = renderHook(() => useAuth());

      // Wait for the authentication check to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should be authenticated with user data
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.error).toBeNull();
      expect(AuthService.isAuthenticated).toHaveBeenCalledTimes(1);
      expect(AuthService.getCurrentUser).toHaveBeenCalledTimes(1);
    });

    it("should handle errors during initial authentication check", async () => {
      // Mock isAuthenticated to return true but getCurrentUser to fail
      vi.mocked(AuthService.isAuthenticated).mockReturnValue(true);
      const error = new Error("Failed to get user data");
      vi.mocked(AuthService.getCurrentUser).mockRejectedValue(error);

      // Render the hook
      const { result } = renderHook(() => useAuth());

      // Wait for the authentication check to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should not be authenticated and have error
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.error).toEqual(error);
      expect(AuthService.isAuthenticated).toHaveBeenCalledTimes(1);
      expect(AuthService.getCurrentUser).toHaveBeenCalledTimes(1);
    });
  });

  describe("login", () => {
    it("should login successfully", async () => {
      // Mock isAuthenticated for initial check
      vi.mocked(AuthService.isAuthenticated).mockReturnValue(false);

      // Mock login to succeed
      vi.mocked(AuthService.login).mockResolvedValue(mockAuthResponse);

      // Render the hook
      const { result } = renderHook(() => useAuth());

      // Wait for initial check to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Login data
      const loginData: LoginRequest = {
        usernameOrEmail: "testuser",
        password: "password123",
      };

      // Perform login
      let response: AuthResponse | undefined;
      await act(async () => {
        response = await result.current.login(loginData);
      });

      // Should be authenticated with user data
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.error).toBeNull();
      expect(response).toEqual(mockAuthResponse);
      expect(AuthService.login).toHaveBeenCalledWith(loginData);
    });

    it("should handle login errors", async () => {
      // Mock isAuthenticated for initial check
      vi.mocked(AuthService.isAuthenticated).mockReturnValue(false);

      // Mock login to fail
      const error = new Error("Invalid credentials");
      vi.mocked(AuthService.login).mockRejectedValue(error);

      // Render the hook
      const { result } = renderHook(() => useAuth());

      // Wait for initial check to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Login data
      const loginData: LoginRequest = {
        usernameOrEmail: "testuser",
        password: "wrong-password",
      };

      // Perform login and expect it to throw
      await act(async () => {
        await expect(result.current.login(loginData)).rejects.toThrow(
          "Invalid credentials"
        );
      });

      // Should not be authenticated and have error
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.error).toEqual(error);
      expect(AuthService.login).toHaveBeenCalledWith(loginData);
    });
  });

  describe("register", () => {
    it("should register successfully", async () => {
      // Mock isAuthenticated for initial check
      vi.mocked(AuthService.isAuthenticated).mockReturnValue(false);

      // Mock register to succeed
      vi.mocked(AuthService.register).mockResolvedValue(mockAuthResponse);

      // Render the hook
      const { result } = renderHook(() => useAuth());

      // Wait for initial check to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Register data
      const registerData: RegisterRequest = {
        username: "testuser",
        email: "test@example.com",
        password: "password123",
        fullName: "Test User",
      };

      // Perform registration
      let response: AuthResponse | undefined;
      await act(async () => {
        response = await result.current.register(registerData);
      });

      // Should be authenticated with user data
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.error).toBeNull();
      expect(response).toEqual(mockAuthResponse);
      expect(AuthService.register).toHaveBeenCalledWith(registerData);
    });

    it("should handle registration errors", async () => {
      // Mock isAuthenticated for initial check
      vi.mocked(AuthService.isAuthenticated).mockReturnValue(false);

      // Mock register to fail
      const error = new Error("Username already exists");
      vi.mocked(AuthService.register).mockRejectedValue(error);

      // Render the hook
      const { result } = renderHook(() => useAuth());

      // Wait for initial check to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Register data
      const registerData: RegisterRequest = {
        username: "existinguser",
        email: "existing@example.com",
        password: "password123",
        fullName: "Existing User",
      };

      // Perform registration and expect it to throw
      await act(async () => {
        await expect(result.current.register(registerData)).rejects.toThrow(
          "Username already exists"
        );
      });

      // Should not be authenticated and have error
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.error).toEqual(error);
      expect(AuthService.register).toHaveBeenCalledWith(registerData);
    });
  });

  describe("logout", () => {
    it("should logout successfully", async () => {
      // Mock isAuthenticated for initial check
      vi.mocked(AuthService.isAuthenticated).mockReturnValue(true);
      vi.mocked(AuthService.getCurrentUser).mockResolvedValue(mockUser);

      // Mock logout to succeed
      vi.mocked(AuthService.logout).mockResolvedValue();

      // Render the hook
      const { result } = renderHook(() => useAuth());

      // Wait for initial check to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should be authenticated initially
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(mockUser);

      // Perform logout
      await act(async () => {
        await result.current.logout();
      });

      // Should not be authenticated after logout
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.error).toBeNull();
      expect(AuthService.logout).toHaveBeenCalledTimes(1);
    });

    it("should handle logout errors and still clear user data", async () => {
      // Mock isAuthenticated for initial check
      vi.mocked(AuthService.isAuthenticated).mockReturnValue(true);
      vi.mocked(AuthService.getCurrentUser).mockResolvedValue(mockUser);

      // Mock logout to fail
      const error = new Error("Network error");
      vi.mocked(AuthService.logout).mockRejectedValue(error);

      // Render the hook
      const { result } = renderHook(() => useAuth());

      // Wait for initial check to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should be authenticated initially
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(mockUser);

      // Perform logout
      await act(async () => {
        await result.current.logout();
      });

      // Should not be authenticated after logout despite error
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.error).toEqual(error);
      expect(AuthService.logout).toHaveBeenCalledTimes(1);
    });
  });

  describe("refreshUser", () => {
    it("should refresh user data successfully", async () => {
      // Mock isAuthenticated for initial check
      vi.mocked(AuthService.isAuthenticated).mockReturnValue(true);
      vi.mocked(AuthService.getCurrentUser).mockResolvedValueOnce(mockUser);

      // Render the hook
      const { result } = renderHook(() => useAuth());

      // Wait for initial check to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should be authenticated initially
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(mockUser);

      // Mock getCurrentUser for refresh with updated user
      const updatedUser = { ...mockUser, fullName: "Updated User" };
      vi.mocked(AuthService.isAuthenticated).mockReturnValue(true);
      vi.mocked(AuthService.getCurrentUser).mockResolvedValueOnce(updatedUser);

      // Perform refresh
      let refreshedUser: User | null = null;
      await act(async () => {
        refreshedUser = await result.current.refreshUser();
      });

      // Should be authenticated with updated user data
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(updatedUser);
      expect(result.current.error).toBeNull();
      expect(refreshedUser).toEqual(updatedUser);
      expect(AuthService.getCurrentUser).toHaveBeenCalledTimes(2);
    });

    it("should handle refresh errors", async () => {
      // Mock isAuthenticated for initial check
      vi.mocked(AuthService.isAuthenticated).mockReturnValue(true);
      vi.mocked(AuthService.getCurrentUser).mockResolvedValueOnce(mockUser);

      // Render the hook
      const { result } = renderHook(() => useAuth());

      // Wait for initial check to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should be authenticated initially
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(mockUser);

      // Mock getCurrentUser for refresh to fail
      const error = new Error("Failed to refresh user data");
      vi.mocked(AuthService.isAuthenticated).mockReturnValue(true);
      vi.mocked(AuthService.getCurrentUser).mockRejectedValueOnce(error);

      // Perform refresh
      let refreshedUser: User | null = null;
      await act(async () => {
        refreshedUser = await result.current.refreshUser();
      });

      // Should not be authenticated after failed refresh
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.error).toEqual(error);
      expect(refreshedUser).toBeNull();
      expect(AuthService.getCurrentUser).toHaveBeenCalledTimes(2);
    });

    it("should return null when not authenticated", async () => {
      // Mock isAuthenticated for initial check
      vi.mocked(AuthService.isAuthenticated).mockReturnValue(false);

      // Render the hook
      const { result } = renderHook(() => useAuth());

      // Wait for initial check to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should not be authenticated initially
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();

      // Mock isAuthenticated for refresh to return false
      vi.mocked(AuthService.isAuthenticated).mockReturnValue(false);

      // Perform refresh
      let refreshedUser: User | null = null;
      await act(async () => {
        refreshedUser = await result.current.refreshUser();
      });

      // Should still not be authenticated
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(refreshedUser).toBeNull();
      expect(AuthService.getCurrentUser).not.toHaveBeenCalled();
    });
  });
});
