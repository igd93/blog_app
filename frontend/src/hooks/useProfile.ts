import { useState, useCallback, useEffect } from "react";
import { UserService } from "@/lib/services/user.service";
import { User } from "@/lib/types/api";

interface UseProfileResult {
  profile: User | null;
  isLoading: boolean;
  error: Error | null;
  fetchProfile: () => Promise<User | null>;
  updateProfile: (data: Partial<User>) => Promise<User>;
  updatePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<void>;
}

export function useProfile(): UseProfileResult {
  const [profile, setProfile] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Fetch user profile
  const fetchProfile = useCallback(async (): Promise<User | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const userData = await UserService.getProfile();
      setProfile(userData);
      return userData;
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to fetch profile");
      setError(error);
      console.error("Error fetching profile:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update user profile
  const updateProfile = useCallback(
    async (data: Partial<User>): Promise<User> => {
      setIsLoading(true);
      setError(null);

      try {
        const updatedProfile = await UserService.updateProfile(data);
        setProfile(updatedProfile);
        return updatedProfile;
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Failed to update profile");
        setError(error);
        console.error("Error updating profile:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Update user password
  const updatePassword = useCallback(
    async (currentPassword: string, newPassword: string): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        await UserService.updatePassword(currentPassword, newPassword);
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Failed to update password");
        setError(error);
        console.error("Error updating password:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Fetch profile on mount
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    isLoading,
    error,
    fetchProfile,
    updateProfile,
    updatePassword,
  };
}
