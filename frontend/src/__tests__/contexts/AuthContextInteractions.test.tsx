import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  waitFor,
  fireEvent,
  act,
} from "@testing-library/react";
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
    login: vi.fn(),
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

// Interactive test component
const AuthInteractionTestComponent = () => {
  const { isAuthenticated, user, loading, login, logout, refreshUserData } =
    useAuth();

  const handleLogin = () => {
    login("test-token", mockUser);
  };

  const handleLogout = () => {
    logout();
  };

  const handleRefresh = async () => {
    await refreshUserData();
  };

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

      <button data-testid="login-button" onClick={handleLogin}>
        Login
      </button>

      <button data-testid="logout-button" onClick={handleLogout}>
        Logout
      </button>

      <button data-testid="refresh-button" onClick={handleRefresh}>
        Refresh User Data
      </button>
    </div>
  );
};

describe("AuthContext Interactions", () => {
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

  it("should handle login button click", async () => {
    vi.mocked(AuthService.isAuthenticated).mockReturnValue(false);

    render(
      <AuthProvider>
        <AuthInteractionTestComponent />
      </AuthProvider>
    );

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByTestId("loading")).not.toBeInTheDocument();
    });

    // Initially not authenticated
    expect(screen.getByTestId("auth-status").textContent).toBe(
      "Not Authenticated"
    );

    // Click login button
    fireEvent.click(screen.getByTestId("login-button"));

    // Should be authenticated after login
    expect(screen.getByTestId("auth-status").textContent).toBe("Authenticated");
    expect(screen.getByTestId("user-info").textContent).toBe(
      "testuser - test@example.com"
    );
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "token",
      "test-token"
    );
  });

  it("should handle logout button click", async () => {
    // Start with authenticated user
    vi.mocked(AuthService.isAuthenticated).mockReturnValue(true);
    vi.mocked(AuthService.getCurrentUser).mockResolvedValue(mockUser);
    vi.mocked(AuthService.logout).mockResolvedValue(undefined);

    render(
      <AuthProvider>
        <AuthInteractionTestComponent />
      </AuthProvider>
    );

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByTestId("loading")).not.toBeInTheDocument();
    });

    // Initially authenticated
    expect(screen.getByTestId("auth-status").textContent).toBe("Authenticated");
    expect(screen.getByTestId("user-info")).toBeInTheDocument();

    // Click logout button - wrap in act since it triggers state updates
    await act(async () => {
      fireEvent.click(screen.getByTestId("logout-button"));
    });

    // Wait for the state to update after logout
    await waitFor(() => {
      expect(screen.getByTestId("auth-status").textContent).toBe(
        "Not Authenticated"
      );
    });

    expect(screen.queryByTestId("user-info")).not.toBeInTheDocument();
    expect(AuthService.logout).toHaveBeenCalledTimes(1);
    expect(localStorageMock.removeItem).toHaveBeenCalledWith("token");
  });

  it("should handle refresh user data button click", async () => {
    // Start with authenticated user
    vi.mocked(AuthService.isAuthenticated).mockReturnValue(true);
    vi.mocked(AuthService.getCurrentUser).mockResolvedValue(mockUser);

    render(
      <AuthProvider>
        <AuthInteractionTestComponent />
      </AuthProvider>
    );

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByTestId("loading")).not.toBeInTheDocument();
    });

    // Initially authenticated with original user data
    expect(screen.getByTestId("auth-status").textContent).toBe("Authenticated");
    expect(screen.getByTestId("user-info").textContent).toBe(
      "testuser - test@example.com"
    );

    // Reset the mock to return updated user data
    const updatedUser = {
      ...mockUser,
      fullName: "Updated Name",
      username: "updateduser",
    };
    vi.mocked(AuthService.getCurrentUser).mockReset();
    vi.mocked(AuthService.getCurrentUser).mockResolvedValue(updatedUser);

    // Click refresh button
    fireEvent.click(screen.getByTestId("refresh-button"));

    // Wait for refresh to complete
    await waitFor(() => {
      expect(screen.getByTestId("user-info").textContent).toBe(
        "updateduser - test@example.com"
      );
    });

    // Should have updated user data
    expect(screen.getByTestId("auth-status").textContent).toBe("Authenticated");
    expect(AuthService.getCurrentUser).toHaveBeenCalledTimes(1);
  });

  it("should handle refresh failure", async () => {
    // Start with authenticated user
    vi.mocked(AuthService.isAuthenticated).mockReturnValue(true);
    vi.mocked(AuthService.getCurrentUser).mockResolvedValue(mockUser);

    render(
      <AuthProvider>
        <AuthInteractionTestComponent />
      </AuthProvider>
    );

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByTestId("loading")).not.toBeInTheDocument();
    });

    // Initially authenticated
    expect(screen.getByTestId("auth-status").textContent).toBe("Authenticated");

    // Reset the mock to fail on refresh
    vi.mocked(AuthService.getCurrentUser).mockReset();
    vi.mocked(AuthService.getCurrentUser).mockRejectedValue(
      new Error("Refresh failed")
    );

    // Click refresh button
    fireEvent.click(screen.getByTestId("refresh-button"));

    // Wait for refresh to complete and fail
    await waitFor(() => {
      expect(screen.getByTestId("auth-status").textContent).toBe(
        "Not Authenticated"
      );
    });

    // Should have cleared authentication state
    expect(screen.queryByTestId("user-info")).not.toBeInTheDocument();
    expect(AuthService.getCurrentUser).toHaveBeenCalledTimes(1);
  });

  it("should maintain authentication state across renders", async () => {
    // Start with authenticated user
    vi.mocked(AuthService.isAuthenticated).mockReturnValue(true);
    vi.mocked(AuthService.getCurrentUser).mockResolvedValue(mockUser);

    const { rerender } = render(
      <AuthProvider>
        <AuthInteractionTestComponent />
      </AuthProvider>
    );

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByTestId("loading")).not.toBeInTheDocument();
    });

    // Initially authenticated
    expect(screen.getByTestId("auth-status").textContent).toBe("Authenticated");

    // Rerender the component
    rerender(
      <AuthProvider>
        <AuthInteractionTestComponent />
      </AuthProvider>
    );

    // Should still be authenticated
    expect(screen.getByTestId("auth-status").textContent).toBe("Authenticated");
    expect(screen.getByTestId("user-info").textContent).toBe(
      "testuser - test@example.com"
    );
  });
});
