import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ProtectedRoute from "@/components/ProtectedRoute";

// Mock dependencies
vi.mock("react-router-dom", () => ({
  Navigate: ({ to, replace }: { to: string; replace?: boolean }) => (
    <div
      data-testid="navigate"
      data-to={to}
      data-replace={replace ? "true" : "false"}
    >
      Redirecting...
    </div>
  ),
}));

// Define types for our mocks
interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
}

// Create different mock implementations for different auth states
const authenticatedMock: AuthContextType = {
  isAuthenticated: true,
  loading: false,
};

const unauthenticatedMock: AuthContextType = {
  isAuthenticated: false,
  loading: false,
};

const loadingMock: AuthContextType = {
  isAuthenticated: false,
  loading: true,
};

// Default to authenticated for most tests
let authContextMock: AuthContextType = authenticatedMock;

// Mock the AuthContext
vi.mock("@/lib/contexts/AuthContext", () => ({
  useAuth: () => authContextMock,
}));

describe("ProtectedRoute", () => {
  it("renders children when user is authenticated", () => {
    // Set to authenticated
    authContextMock = authenticatedMock;

    render(
      <ProtectedRoute>
        <div data-testid="protected-content">Protected Content</div>
      </ProtectedRoute>
    );

    // Check that the protected content is rendered
    expect(screen.getByTestId("protected-content")).toBeInTheDocument();
    expect(screen.getByText("Protected Content")).toBeInTheDocument();

    // Ensure no redirect happened
    expect(screen.queryByTestId("navigate")).not.toBeInTheDocument();
  });

  it("redirects to login page when user is not authenticated", () => {
    // Set to unauthenticated
    authContextMock = unauthenticatedMock;

    render(
      <ProtectedRoute>
        <div data-testid="protected-content">Protected Content</div>
      </ProtectedRoute>
    );

    // Check that the redirect happened
    expect(screen.getByTestId("navigate")).toBeInTheDocument();
    expect(screen.getByTestId("navigate").getAttribute("data-to")).toBe(
      "/login"
    );

    // Check that replace is true (to prevent back navigation to protected route)
    expect(screen.getByTestId("navigate").getAttribute("data-replace")).toBe(
      "true"
    );

    // Ensure protected content is not rendered
    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
  });

  it("shows loading spinner when authentication state is loading", () => {
    // Set to loading
    authContextMock = loadingMock;

    render(
      <ProtectedRoute>
        <div data-testid="protected-content">Protected Content</div>
      </ProtectedRoute>
    );

    // Check that the loading spinner is rendered
    // The spinner doesn't have a role, so we'll check for the div with the animate-spin class
    const spinner = screen.getByTestId("loading-spinner");
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass("animate-spin");

    // Ensure protected content is not rendered
    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();

    // Ensure no redirect happened
    expect(screen.queryByTestId("navigate")).not.toBeInTheDocument();
  });

  it("works with nested protected routes when authenticated", () => {
    // Set to authenticated
    authContextMock = authenticatedMock;

    render(
      <ProtectedRoute>
        <div data-testid="outer-protected">
          Outer Protected Content
          <ProtectedRoute>
            <div data-testid="inner-protected">Inner Protected Content</div>
          </ProtectedRoute>
        </div>
      </ProtectedRoute>
    );

    // Check that both outer and inner protected content are rendered
    expect(screen.getByTestId("outer-protected")).toBeInTheDocument();
    expect(screen.getByTestId("inner-protected")).toBeInTheDocument();
    expect(screen.getByText("Outer Protected Content")).toBeInTheDocument();
    expect(screen.getByText("Inner Protected Content")).toBeInTheDocument();

    // Ensure no redirect happened
    expect(screen.queryByTestId("navigate")).not.toBeInTheDocument();
  });

  it("redirects nested protected routes when not authenticated", () => {
    // Set to unauthenticated
    authContextMock = unauthenticatedMock;

    render(
      <ProtectedRoute>
        <div data-testid="outer-protected">
          Outer Protected Content
          <ProtectedRoute>
            <div data-testid="inner-protected">Inner Protected Content</div>
          </ProtectedRoute>
        </div>
      </ProtectedRoute>
    );

    // Check that the redirect happened
    expect(screen.getByTestId("navigate")).toBeInTheDocument();

    // Ensure neither outer nor inner protected content is rendered
    expect(screen.queryByTestId("outer-protected")).not.toBeInTheDocument();
    expect(screen.queryByTestId("inner-protected")).not.toBeInTheDocument();
  });
});
