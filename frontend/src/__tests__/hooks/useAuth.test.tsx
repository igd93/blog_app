import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "@/lib/contexts/AuthContext";
import { AuthService } from "@/lib/services/auth.service";
import { User } from "@/lib/types/api";
import React from "react";

// Mock the AuthService
vi.mock("@/lib/services/auth.service", () => ({
  AuthService: {
    isAuthenticated: vi.fn(),
    getCurrentUser: vi.fn(),
    logout: vi.fn(),
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
};

// Wrapper component for testing hooks that use context
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe("useAuth hook", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    localStorageMock.clear();

    // Reset all mocks to their default values
    vi.mocked(AuthService.isAuthenticated).mockReturnValue(false);
    vi.mocked(AuthService.getCurrentUser).mockRejectedValue(
      new Error("Not mocked")
    );
    vi.mocked(AuthService.logout).mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should initialize with loading state and not authenticated", async () => {
    // Create a promise that never resolves during the test
    // This will keep the component in loading state
    const neverResolvingPromise = new Promise<User>(() => {
      // This promise intentionally never resolves
    });

    // Mock isAuthenticated to return true so getCurrentUser is called
    vi.mocked(AuthService.isAuthenticated).mockReturnValue(true);

    // Mock getCurrentUser to return our never-resolving promise
    vi.mocked(AuthService.getCurrentUser).mockReturnValue(
      neverResolvingPromise
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Initial state should be loading
    // The first render should have loading=true
    expect(result.current.loading).toBe(true);
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it("should complete authentication check when no token exists", async () => {
    // Mock isAuthenticated to return false (no token)
    vi.mocked(AuthService.isAuthenticated).mockReturnValue(false);

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Wait for the initial auth check to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // After loading, should still not be authenticated
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(AuthService.isAuthenticated).toHaveBeenCalledTimes(1);
    expect(AuthService.getCurrentUser).not.toHaveBeenCalled();
  });

  it("should authenticate user when token exists", async () => {
    // Mock isAuthenticated to return true (token exists)
    vi.mocked(AuthService.isAuthenticated).mockReturnValue(true);
    vi.mocked(AuthService.getCurrentUser).mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Initial state should be loading
    expect(result.current.loading).toBe(true);

    // Wait for the initial auth check to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // After loading, should be authenticated with user data
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(mockUser);
    expect(AuthService.isAuthenticated).toHaveBeenCalledTimes(1);
    expect(AuthService.getCurrentUser).toHaveBeenCalledTimes(1);
  });

  it("should handle login correctly", async () => {
    vi.mocked(AuthService.isAuthenticated).mockReturnValue(false);

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Wait for the initial auth check to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Initially not authenticated
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();

    // Perform login
    await act(async () => {
      result.current.login("fake-token", mockUser);
    });

    // Should be authenticated after login
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(mockUser);
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "token",
      "fake-token"
    );
  });

  it("should handle logout correctly", async () => {
    // Start with authenticated user
    vi.mocked(AuthService.isAuthenticated).mockReturnValue(true);
    vi.mocked(AuthService.getCurrentUser).mockResolvedValue(mockUser);
    vi.mocked(AuthService.logout).mockResolvedValue(undefined);

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Wait for the initial auth check to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Initially authenticated
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(mockUser);

    // Perform logout
    await act(async () => {
      await result.current.logout();
    });

    // Should not be authenticated after logout
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(AuthService.logout).toHaveBeenCalledTimes(1);
    expect(localStorageMock.removeItem).toHaveBeenCalledWith("token");
  });

  it("should handle refreshUserData correctly", async () => {
    // Start with authenticated user
    vi.mocked(AuthService.isAuthenticated).mockReturnValue(true);
    vi.mocked(AuthService.getCurrentUser).mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Wait for the initial auth check to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Reset the mock to return updated user data
    const updatedUser = { ...mockUser, fullName: "Updated Name" };
    vi.mocked(AuthService.getCurrentUser).mockReset();
    vi.mocked(AuthService.getCurrentUser).mockResolvedValue(updatedUser);

    // Call refreshUserData
    let refreshedUser: User | null = null;
    await act(async () => {
      refreshedUser = await result.current.refreshUserData();
    });

    // Should have updated user data
    expect(result.current.user).toEqual(updatedUser);
    expect(refreshedUser).toEqual(updatedUser);
    expect(AuthService.getCurrentUser).toHaveBeenCalledTimes(1);
  });

  it("should handle failed authentication", async () => {
    // Mock isAuthenticated to return true but getCurrentUser to fail
    vi.mocked(AuthService.isAuthenticated).mockReturnValue(true);
    vi.mocked(AuthService.getCurrentUser).mockRejectedValue(
      new Error("Auth failed")
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Wait for the initial auth check to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should not be authenticated after failed getCurrentUser
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(AuthService.isAuthenticated).toHaveBeenCalledTimes(1);
    expect(AuthService.getCurrentUser).toHaveBeenCalledTimes(1);
    expect(localStorageMock.removeItem).toHaveBeenCalledWith("token");
  });

  it("should handle failed refreshUserData", async () => {
    // Start with authenticated user
    vi.mocked(AuthService.isAuthenticated).mockReturnValue(true);
    vi.mocked(AuthService.getCurrentUser).mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Wait for the initial auth check to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Reset the mock to fail on refresh
    vi.mocked(AuthService.getCurrentUser).mockReset();
    vi.mocked(AuthService.getCurrentUser).mockRejectedValue(
      new Error("Refresh failed")
    );

    // Call refreshUserData
    let refreshedUser: User | null = null;
    await act(async () => {
      refreshedUser = await result.current.refreshUserData();
    });

    // Should have cleared authentication state
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(refreshedUser).toBeNull();
    expect(AuthService.getCurrentUser).toHaveBeenCalledTimes(1);
  });
});
