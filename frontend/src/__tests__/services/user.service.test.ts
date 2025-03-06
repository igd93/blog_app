import { describe, it, expect, vi, beforeEach } from "vitest";
import { UserService } from "@/lib/services/user.service";
import api from "@/lib/axios";
import { User } from "@/lib/types/api";

// Mock the axios instance
vi.mock("@/lib/axios", () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
  },
}));

describe("UserService", () => {
  // Mock user data
  const mockUser: User = {
    id: "user-123",
    username: "testuser",
    email: "test@example.com",
    fullName: "Test User",
    bio: "Test bio",
    avatarUrl: "https://example.com/avatar.jpg",
  };

  // Reset mocks before each test
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("getProfile", () => {
    it("should fetch the user profile", async () => {
      // Mock the API response
      vi.mocked(api.get).mockResolvedValueOnce({
        data: mockUser,
      });

      // Call the service method
      const result = await UserService.getProfile();

      // Verify the API was called correctly
      expect(api.get).toHaveBeenCalledWith("/users/profile");

      // Verify the result
      expect(result).toEqual(mockUser);
    });

    it("should handle API errors", async () => {
      // Mock the API to throw an error
      const error = new Error("Failed to fetch profile");
      vi.mocked(api.get).mockRejectedValueOnce(error);

      // Call the service method and expect it to throw
      await expect(UserService.getProfile()).rejects.toThrow(
        "Failed to fetch profile"
      );

      // Verify the API was called
      expect(api.get).toHaveBeenCalledTimes(1);
    });
  });

  describe("updateProfile", () => {
    it("should update the user profile", async () => {
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

      // Mock the API response
      vi.mocked(api.put).mockResolvedValueOnce({
        data: updatedUser,
      });

      // Call the service method
      const result = await UserService.updateProfile(updateData);

      // Verify the API was called correctly
      expect(api.put).toHaveBeenCalledWith("/users/profile", updateData);

      // Verify the result
      expect(result).toEqual(updatedUser);
    });

    it("should handle API errors during profile update", async () => {
      // Profile update data
      const updateData: Partial<User> = {
        fullName: "Updated Name",
      };

      // Mock the API to throw an error
      const error = new Error("Failed to update profile");
      vi.mocked(api.put).mockRejectedValueOnce(error);

      // Call the service method and expect it to throw
      await expect(UserService.updateProfile(updateData)).rejects.toThrow(
        "Failed to update profile"
      );

      // Verify the API was called
      expect(api.put).toHaveBeenCalledTimes(1);
    });
  });

  describe("updatePassword", () => {
    it("should update the user password", async () => {
      // Password data
      const currentPassword = "oldPassword123";
      const newPassword = "newPassword456";

      // Mock the API response
      vi.mocked(api.put).mockResolvedValueOnce({
        data: undefined,
      });

      // Call the service method
      await UserService.updatePassword(currentPassword, newPassword);

      // Verify the API was called correctly
      expect(api.put).toHaveBeenCalledWith("/users/password", {
        currentPassword,
        newPassword,
      });
    });

    it("should handle API errors during password update", async () => {
      // Password data
      const currentPassword = "wrongPassword";
      const newPassword = "newPassword456";

      // Mock the API to throw an error
      const error = new Error("Current password is incorrect");
      vi.mocked(api.put).mockRejectedValueOnce(error);

      // Call the service method and expect it to throw
      await expect(
        UserService.updatePassword(currentPassword, newPassword)
      ).rejects.toThrow("Current password is incorrect");

      // Verify the API was called
      expect(api.put).toHaveBeenCalledTimes(1);
    });
  });
});
