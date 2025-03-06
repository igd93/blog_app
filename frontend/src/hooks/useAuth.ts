import { useState, useEffect, useCallback } from "react";
import { AuthService } from "@/lib/services/auth.service";
import {
  User,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
} from "@/lib/types/api";

interface UseAuthResult {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Error | null;
  login: (data: LoginRequest) => Promise<AuthResponse>;
  register: (data: RegisterRequest) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<User | null>;
}

export function useAuth(): UseAuthResult {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (AuthService.isAuthenticated()) {
          const userData = await AuthService.getCurrentUser();
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Authentication check failed");
        setError(error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = useCallback(
    async (data: LoginRequest): Promise<AuthResponse> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await AuthService.login(data);
        setUser(response.user);
        setIsAuthenticated(true);
        return response;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Login failed");
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Register function
  const register = useCallback(
    async (data: RegisterRequest): Promise<AuthResponse> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await AuthService.register(data);
        setUser(response.user);
        setIsAuthenticated(true);
        return response;
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Registration failed");
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Logout function
  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await AuthService.logout();
      setUser(null);
      setIsAuthenticated(false);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Logout failed");
      setError(error);
      // Still clear user data even if logout API fails
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Refresh user data
  const refreshUser = useCallback(async (): Promise<User | null> => {
    if (!AuthService.isAuthenticated()) {
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const userData = await AuthService.getCurrentUser();
      setUser(userData);
      setIsAuthenticated(true);
      return userData;
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to refresh user data");
      setError(error);
      setUser(null);
      setIsAuthenticated(false);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    refreshUser,
  };
}
