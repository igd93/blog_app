import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Header from "@/components/Header";
import { toast } from "sonner";
import React from "react";
import * as reactRouterDom from "react-router-dom";

// Define types for our mocks
interface User {
  id: string;
  username: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  logout: () => Promise<void>;
}

// Mock dependencies
vi.mock("react-router-dom", () => ({
  Link: ({
    to,
    children,
    className,
  }: {
    to: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={to} className={className} data-testid={`link-${to}`}>
      {children}
    </a>
  ),
  useNavigate: () => vi.fn((path) => path),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock the dropdown menu components
vi.mock("@/components/ui/dropdown-menu", () => {
  return {
    DropdownMenu: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="dropdown-menu">{children}</div>
    ),
    DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="dropdown-trigger">{children}</div>
    ),
    DropdownMenuContent: ({
      children,
      className,
    }: {
      children: React.ReactNode;
      className?: string;
    }) => (
      <div data-testid="dropdown-content" className={className}>
        {children}
      </div>
    ),
    DropdownMenuItem: ({
      children,
      className,
      onClick,
    }: {
      children: React.ReactNode;
      className?: string;
      onClick?: () => void;
    }) => (
      <div data-testid="dropdown-item" className={className} onClick={onClick}>
        {children}
      </div>
    ),
    DropdownMenuSeparator: () => <hr data-testid="dropdown-separator" />,
  };
});

// Mock the AuthContext
const mockLogout = vi.fn().mockResolvedValue(undefined);

// Create two different mock implementations for authenticated and unauthenticated states
const authenticatedMock: AuthContextType = {
  isAuthenticated: true,
  user: {
    id: "1",
    username: "testuser",
    email: "test@example.com",
    fullName: "Test User",
  },
  logout: mockLogout,
};

const unauthenticatedMock: AuthContextType = {
  isAuthenticated: false,
  user: null,
  logout: mockLogout,
};

// Default to authenticated for most tests
let authContextMock: AuthContextType = authenticatedMock;

vi.mock("@/lib/contexts/AuthContext", () => ({
  useAuth: () => authContextMock,
}));

// Mock the Avatar components
vi.mock("@/components/ui/avatar", () => {
  return {
    Avatar: ({
      children,
      className,
    }: {
      children: React.ReactNode;
      className?: string;
    }) => (
      <div data-testid="avatar" className={className}>
        {children}
      </div>
    ),
    AvatarImage: ({ src, alt }: { src: string; alt: string }) => (
      <img data-testid="avatar-image" src={src} alt={alt} />
    ),
    AvatarFallback: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="avatar-fallback">{children}</div>
    ),
  };
});

// Mock the Button component
vi.mock("@/components/ui/button", () => {
  return {
    Button: ({
      children,
      variant,
      className,
      onClick,
    }: {
      children: React.ReactNode;
      variant?: string;
      className?: string;
      onClick?: () => void;
    }) => (
      <button
        data-testid={`button-${variant || "default"}`}
        className={className}
        onClick={onClick}
      >
        {children}
      </button>
    ),
  };
});

describe("Header", () => {
  const navigateMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset to authenticated by default
    authContextMock = authenticatedMock;

    // Mock the navigate function
    const mockUseNavigate = vi.spyOn(reactRouterDom, "useNavigate");
    mockUseNavigate.mockReturnValue(navigateMock);
  });

  it("renders the logo and navigation links", () => {
    render(<Header />);

    // Check for logo
    expect(screen.getByText("Blog")).toBeInTheDocument();

    // Check for navigation links
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("About")).toBeInTheDocument();
  });

  it("renders the search bar", () => {
    render(<Header />);

    // Check for search input
    expect(screen.getByPlaceholderText("Search posts...")).toBeInTheDocument();
  });

  it("submits search form", () => {
    render(<Header />);

    const searchForm = screen
      .getByPlaceholderText("Search posts...")
      .closest("form");
    expect(searchForm).toBeInTheDocument();

    // Submit the form
    if (searchForm) {
      fireEvent.submit(searchForm);
    }

    // Currently, the search function doesn't do much, so we're just testing that it doesn't crash
    // In a real app, we would test that the search function is called with the correct parameters
  });

  it("renders user avatar and dropdown when authenticated", () => {
    render(<Header />);

    // Check for avatar with initials
    expect(screen.getByText("TU")).toBeInTheDocument();

    // Dropdown content should be visible in our mock implementation
    expect(screen.getByText("Test User")).toBeInTheDocument();
    expect(screen.getByText("test@example.com")).toBeInTheDocument();
    expect(screen.getByText("Profile")).toBeInTheDocument();
    expect(screen.getByText("Log out")).toBeInTheDocument();
  });

  it("logs out successfully when logout button is clicked", async () => {
    render(<Header />);

    // Find and click the logout button
    const logoutButton = screen.getByText("Log out");
    fireEvent.click(logoutButton);

    // Verify logout function was called
    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled();
    });

    // Verify success message was shown
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Successfully logged out!");
    });

    // Verify navigation to login page
    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith("/login");
    });
  });

  it("handles logout errors", async () => {
    // Mock logout to throw an error
    mockLogout.mockRejectedValueOnce(new Error("Logout failed"));

    render(<Header />);

    // Find and click the logout button
    const logoutButton = screen.getByText("Log out");
    fireEvent.click(logoutButton);

    // Verify error message was shown
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "There was a problem logging out. Please try again."
      );
    });
  });

  it("renders login and signup buttons when not authenticated", () => {
    // Set to unauthenticated for this test
    authContextMock = unauthenticatedMock;

    render(<Header />);

    // Check for login and signup buttons
    expect(screen.getByText("Log in")).toBeInTheDocument();
    expect(screen.getByText("Sign up")).toBeInTheDocument();
  });

  it("navigates to login page when login button is clicked", () => {
    // Set to unauthenticated for this test
    authContextMock = unauthenticatedMock;

    render(<Header />);

    // Click login button
    const loginButton = screen.getByText("Log in");
    fireEvent.click(loginButton);

    // Verify navigation to login page
    expect(navigateMock).toHaveBeenCalledWith("/login");
  });

  it("navigates to register page when signup button is clicked", () => {
    // Set to unauthenticated for this test
    authContextMock = unauthenticatedMock;

    render(<Header />);

    // Click signup button
    const signupButton = screen.getByText("Sign up");
    fireEvent.click(signupButton);

    // Verify navigation to register page
    expect(navigateMock).toHaveBeenCalledWith("/register");
  });

  it("displays correct initials in avatar", () => {
    // Test with different user name
    authContextMock = {
      ...authenticatedMock,
      user: {
        ...authenticatedMock.user!,
        fullName: "John Doe",
      },
    };

    render(<Header />);

    // Check for avatar with correct initials
    expect(screen.getByText("JD")).toBeInTheDocument();
  });

  it("handles missing user name gracefully", () => {
    // Test with user without fullName
    authContextMock = {
      ...authenticatedMock,
      user: {
        ...authenticatedMock.user!,
        fullName: undefined,
      },
    };

    render(<Header />);

    // Check for avatar with fallback
    expect(screen.getByText("?")).toBeInTheDocument();
  });
});
