import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ProfilePage from "../../pages/ProfilePage";
import { UserService } from "@/lib/services/user.service";
import { toast } from "sonner";
import React from "react";

// Mock user data
const mockUser = {
  id: "1",
  username: "testuser",
  email: "test@example.com",
  fullName: "Test User",
  bio: "This is a test bio",
  avatarUrl: undefined,
};

// Mock dependencies
vi.mock("@/lib/services/user.service", () => ({
  UserService: {
    updateProfile: vi.fn().mockResolvedValue({}),
    updatePassword: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock the AuthContext
vi.mock("@/lib/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: mockUser,
    refreshUserData: vi.fn().mockResolvedValue(undefined),
  }),
}));

// Mock the Tabs component to make testing easier
vi.mock("@/components/ui/tabs", () => {
  return {
    // @ts-expect-error - Ignoring unused defaultValue parameter
    Tabs: ({ children }) => <div data-testid="tabs-mock">{children}</div>,
    TabsList: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="tabs-list-mock">{children}</div>
    ),
    TabsTrigger: ({
      children,
      value,
    }: {
      children: React.ReactNode;
      value: string;
    }) => <button data-testid={`tab-trigger-${value}`}>{children}</button>,
    TabsContent: ({
      children,
      value,
    }: {
      children: React.ReactNode;
      value: string;
    }) => <div data-testid={`tab-content-${value}`}>{children}</div>,
  };
});

// Skip the password tests for now
describe("ProfilePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(UserService.updateProfile).mockResolvedValue({
      ...mockUser,
      fullName: "Updated Name",
      bio: "Updated bio information",
    });
    vi.mocked(UserService.updatePassword).mockResolvedValue(undefined);
  });

  it("renders user profile information", () => {
    render(<ProfilePage />);

    // Check that user information is displayed
    expect(screen.getByDisplayValue("Test User")).toBeInTheDocument();
    expect(screen.getByDisplayValue("test@example.com")).toBeInTheDocument();
    expect(screen.getByDisplayValue("This is a test bio")).toBeInTheDocument();

    // Check that avatar with initials is displayed
    expect(screen.getByText("TU")).toBeInTheDocument();
  });

  it("updates profile successfully", async () => {
    render(<ProfilePage />);

    // Change the name and bio
    const nameInput = screen.getByLabelText(/full name/i);
    fireEvent.change(nameInput, { target: { value: "Updated Name" } });

    const bioInput = screen.getByLabelText(/bio/i);
    fireEvent.change(bioInput, {
      target: { value: "Updated bio information" },
    });

    // Submit the form
    const updateProfileButton = screen.getByRole("button", {
      name: /update profile/i,
    });
    fireEvent.click(updateProfileButton);

    // Verify the service was called with the correct data
    await waitFor(() => {
      expect(UserService.updateProfile).toHaveBeenCalledWith({
        fullName: "Updated Name",
        bio: "Updated bio information",
      });
    });

    // Verify success message was shown
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        "Profile updated successfully!"
      );
    });
  });

  it("handles profile update errors", async () => {
    // Mock the updateProfile service to throw an error
    vi.mocked(UserService.updateProfile).mockRejectedValueOnce(
      new Error("Update failed")
    );

    render(<ProfilePage />);

    // Submit the form without changing anything
    const updateProfileButton = screen.getByRole("button", {
      name: /update profile/i,
    });
    fireEvent.click(updateProfileButton);

    // Verify error message was shown
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Failed to update profile. Please try again."
      );
    });
  });
});
