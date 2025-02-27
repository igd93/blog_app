import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { User } from "../types/api";
import { AuthService } from "../services/auth.service";

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  refreshUserData: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  loading: true,
  login: () => {},
  logout: () => {},
  refreshUserData: async () => null,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Function to fetch user data - can be called whenever we need fresh data
  const refreshUserData = useCallback(async (): Promise<User | null> => {
    console.log("Refreshing user data...");
    try {
      const userDetails = await AuthService.getCurrentUser();
      console.log("Refreshed user data:", userDetails);
      setUser(userDetails);
      setIsAuthenticated(true);
      return userDetails;
    } catch (error) {
      console.error("Failed to refresh user details:", error);
      setIsAuthenticated(false);
      setUser(null);
      return null;
    }
  }, []);

  // On mount, check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      console.log("Checking authentication status...");
      setLoading(true);

      const hasToken = AuthService.isAuthenticated();
      console.log("Token exists:", hasToken);

      if (hasToken) {
        try {
          // Try to get user profile
          const userDetails = await AuthService.getCurrentUser();
          console.log(
            "User details loaded on initial auth check:",
            userDetails
          );
          setUser(userDetails);
          setIsAuthenticated(true);
        } catch (error) {
          console.error("Failed to get user details on initial load:", error);
          // If fetching user fails, clear token
          localStorage.removeItem("token");
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        // No token found
        setUser(null);
        setIsAuthenticated(false);
      }

      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = useCallback((token: string, userData: User) => {
    console.log("Setting user data on login:", userData);
    localStorage.setItem("token", token);
    setUser(userData);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(async () => {
    try {
      await AuthService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    }

    localStorage.removeItem("token");
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      isAuthenticated,
      user,
      loading,
      login,
      logout,
      refreshUserData,
    }),
    [isAuthenticated, user, loading, login, logout, refreshUserData]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
