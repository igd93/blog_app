import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
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

// Test component that uses the auth context
const TestComponent = () => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div data-testid="loading">Loading...</div>;
  }

  return (
    <div>
      <div data-testid="auth-status">
        {isAuthenticated ? "Authenticated" : "Not Authenticated"}
      </div>
      {user && (
        <div data-testid="user-info">
          {user.username} - {user.email}
        </div>
      )}
    </div>
  );
};

describe("AuthContext", () => {
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

  it("should show loading state initially", async () => {
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

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Should show loading initially - this should now be captured
    // since the promise never resolves, the component stays in loading state
    expect(screen.getByTestId("loading")).toBeInTheDocument();
  });

  it("should show unauthenticated state when no token exists", async () => {
    vi.mocked(AuthService.isAuthenticated).mockReturnValue(false);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByTestId("loading")).not.toBeInTheDocument();
    });

    // Should show not authenticated
    expect(screen.getByTestId("auth-status").textContent).toBe(
      "Not Authenticated"
    );

    expect(screen.queryByTestId("user-info")).not.toBeInTheDocument();
    expect(AuthService.isAuthenticated).toHaveBeenCalledTimes(1);
    expect(AuthService.getCurrentUser).not.toHaveBeenCalled();
  });

  it("should show authenticated state when token exists and user data is loaded", async () => {
    vi.mocked(AuthService.isAuthenticated).mockReturnValue(true);
    vi.mocked(AuthService.getCurrentUser).mockResolvedValue(mockUser);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByTestId("loading")).not.toBeInTheDocument();
    });

    // Should show authenticated
    expect(screen.getByTestId("auth-status").textContent).toBe("Authenticated");
    expect(screen.getByTestId("user-info").textContent).toBe(
      "testuser - test@example.com"
    );
    expect(AuthService.isAuthenticated).toHaveBeenCalledTimes(1);
    expect(AuthService.getCurrentUser).toHaveBeenCalledTimes(1);
  });

  it("should handle authentication failure", async () => {
    vi.mocked(AuthService.isAuthenticated).mockReturnValue(true);
    vi.mocked(AuthService.getCurrentUser).mockRejectedValue(
      new Error("Auth failed")
    );

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByTestId("loading")).not.toBeInTheDocument();
    });

    // Should show not authenticated after failure
    expect(screen.getByTestId("auth-status").textContent).toBe(
      "Not Authenticated"
    );
    expect(screen.queryByTestId("user-info")).not.toBeInTheDocument();
    expect(AuthService.isAuthenticated).toHaveBeenCalledTimes(1);
    expect(AuthService.getCurrentUser).toHaveBeenCalledTimes(1);
    expect(localStorageMock.removeItem).toHaveBeenCalledWith("token");
  });

  it("should provide context to nested components", async () => {
    vi.mocked(AuthService.isAuthenticated).mockReturnValue(true);
    vi.mocked(AuthService.getCurrentUser).mockResolvedValue(mockUser);

    const NestedComponent = () => {
      const { user } = useAuth();
      return user ? <div data-testid="nested-user">{user.fullName}</div> : null;
    };

    render(
      <AuthProvider>
        <div>
          <TestComponent />
          <NestedComponent />
        </div>
      </AuthProvider>
    );

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByTestId("loading")).not.toBeInTheDocument();
    });

    // Nested component should have access to user data
    expect(screen.getByTestId("nested-user")).toBeInTheDocument();
    expect(screen.getByTestId("nested-user").textContent).toBe("Test User");
  });
});
