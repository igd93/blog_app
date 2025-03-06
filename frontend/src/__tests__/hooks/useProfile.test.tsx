import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useProfile } from "@/hooks/useProfile";
import { UserService } from "@/lib/services/user.service";
import { User } from "@/lib/types/api";

// Mock the UserService
vi.mock("@/lib/services/user.service", () => ({
  UserService: {
    getProfile: vi.fn(),
    updateProfile: vi.fn(),
    updatePassword: vi.fn(),
  },
}));

describe("useProfile hook", () => {
  // Mock user data
  const mockUser: User = {
    id: "user-123",
    username: "testuser",
    email: "test@example.com",
    fullName: "Test User",
    bio: "Test bio",
    avatarUrl: "https://example.com/avatar.jpg",
  };

  // Mock console methods to reduce noise in test output
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;

  beforeEach(() => {
    vi.resetAllMocks();

    // Silence console logs and errors during tests
    console.log = vi.fn();
    console.error = vi.fn();

    // Default mock implementations
    vi.mocked(UserService.getProfile).mockResolvedValue(mockUser);
  });

  afterEach(() => {
    // Restore console methods
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
  });

  describe("initial state and fetching profile", () => {
    it("should fetch profile on mount", async () => {
      // Render the hook
      const { result } = renderHook(() => useProfile());

      // Initially should be loading
      expect(result.current.isLoading).toBe(true);
      expect(result.current.profile).toBeNull();
      expect(result.current.error).toBeNull();

      // Wait for the fetch to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should have profile data
      expect(result.current.profile).toEqual(mockUser);
      expect(result.current.error).toBeNull();
      expect(UserService.getProfile).toHaveBeenCalledTimes(1);
    });

    it("should handle errors when fetching profile", async () => {
      // Mock the service to throw an error
      const error = new Error("Failed to fetch profile");
      vi.mocked(UserService.getProfile).mockRejectedValueOnce(error);

      // Render the hook
      const { result } = renderHook(() => useProfile());

      // Wait for the fetch to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should have error state
      expect(result.current.profile).toBeNull();
      expect(result.current.error).toEqual(error);
      expect(UserService.getProfile).toHaveBeenCalledTimes(1);
    });

    it("should allow manual refresh of profile data", async () => {
      // Render the hook
      const { result } = renderHook(() => useProfile());

      // Wait for initial fetch to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Reset mock to track the next call
      vi.mocked(UserService.getProfile).mockClear();

      // Updated user data for the second call
      const updatedUser = { ...mockUser, fullName: "Updated Name" };
      vi.mocked(UserService.getProfile).mockResolvedValueOnce(updatedUser);

      // Manually refresh profile
      let refreshedProfile: User | null = null;
      await act(async () => {
        refreshedProfile = await result.current.fetchProfile();
      });

      // Verify the service was called
      expect(UserService.getProfile).toHaveBeenCalledTimes(1);

      // Verify the returned and stored profile
      expect(refreshedProfile).toEqual(updatedUser);
      expect(result.current.profile).toEqual(updatedUser);
    });
  });

  describe("updating profile", () => {
    it("should update profile information", async () => {
      // Profile update data
      const updateData: Partial<User> = {
        fullName: "Updated Name",
        bio: "Updated bio",
      };

      // Updated user data
      const updatedUser: User = {
        ...mockUser,
        ...updateData,
      };

      // Mock the service to return updated user
      vi.mocked(UserService.updateProfile).mockResolvedValueOnce(updatedUser);

      // Render the hook
      const { result } = renderHook(() => useProfile());

      // Wait for initial fetch to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Update profile
      let returnedProfile: User | undefined;
      await act(async () => {
        returnedProfile = await result.current.updateProfile(updateData);
      });

      // Verify the service was called correctly
      expect(UserService.updateProfile).toHaveBeenCalledWith(updateData);

      // Verify the returned and stored profile
      expect(returnedProfile).toEqual(updatedUser);
      expect(result.current.profile).toEqual(updatedUser);
    });

    it("should handle errors when updating profile", async () => {
      // Profile update data
      const updateData: Partial<User> = {
        fullName: "Updated Name",
      };

      // Mock the service to throw an error
      const error = new Error("Failed to update profile");
      vi.mocked(UserService.updateProfile).mockRejectedValueOnce(error);

      // Render the hook
      const { result } = renderHook(() => useProfile());

      // Wait for initial fetch to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Try to update profile and expect it to throw
      await act(async () => {
        await expect(result.current.updateProfile(updateData)).rejects.toThrow(
          "Failed to update profile"
        );
      });

      // Verify the service was called
      expect(UserService.updateProfile).toHaveBeenCalledTimes(1);

      // Verify the error state and that profile was not updated
      expect(result.current.error).toEqual(error);
      expect(result.current.profile).toEqual(mockUser); // Still has original data
    });
  });

  describe("updating password", () => {
    it("should update password", async () => {
      // Password data
      const currentPassword = "oldPassword123";
      const newPassword = "newPassword456";

      // Mock the service to succeed
      vi.mocked(UserService.updatePassword).mockResolvedValueOnce();

      // Render the hook
      const { result } = renderHook(() => useProfile());

      // Wait for initial fetch to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Update password
      await act(async () => {
        await result.current.updatePassword(currentPassword, newPassword);
      });

      // Verify the service was called correctly
      expect(UserService.updatePassword).toHaveBeenCalledWith(
        currentPassword,
        newPassword
      );

      // Profile should remain unchanged
      expect(result.current.profile).toEqual(mockUser);
      expect(result.current.error).toBeNull();
    });

    it("should handle errors when updating password", async () => {
      // Password data
      const currentPassword = "wrongPassword";
      const newPassword = "newPassword456";

      // Mock the service to throw an error
      const error = new Error("Current password is incorrect");
      vi.mocked(UserService.updatePassword).mockRejectedValueOnce(error);

      // Render the hook
      const { result } = renderHook(() => useProfile());

      // Wait for initial fetch to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Try to update password and expect it to throw
      await act(async () => {
        await expect(
          result.current.updatePassword(currentPassword, newPassword)
        ).rejects.toThrow("Current password is incorrect");
      });

      // Verify the service was called
      expect(UserService.updatePassword).toHaveBeenCalledTimes(1);

      // Verify the error state
      expect(result.current.error).toEqual(error);

      // Profile should remain unchanged
      expect(result.current.profile).toEqual(mockUser);
    });
  });
});
