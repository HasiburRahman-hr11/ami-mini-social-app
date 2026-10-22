import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const getCurrentUser = useCallback(async () => {
    const response = await api.get("/auth/me");
    const currentUser =
      response.data?.data?.user ?? response.data?.user ?? response.data?.data;

    setUser(currentUser ?? null);
    return currentUser;
  }, []);

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      try {
        const response = await api.get("/auth/me");
        const currentUser =
          response.data?.data?.user ??
          response.data?.user ??
          response.data?.data;

        if (active) setUser(currentUser ?? null);
      } catch (error) {
        if (error.response?.status === 401) {
          try {
            await api.post("/auth/refresh");
            const response = await api.get("/auth/me");
            const currentUser =
              response.data?.data?.user ??
              response.data?.user ??
              response.data?.data;

            if (active) setUser(currentUser ?? null);
          } catch {
            if (active) setUser(null);
          }
        } else if (active) {
          // Keep the app usable if the API is temporarily unavailable.
          setUser(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    restoreSession();

    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(
    async (credentials) => {
      const response = await api.post("/auth/login", credentials);
      const currentUser =
        response.data?.data?.user ?? response.data?.user ?? response.data?.data;

      setUser(currentUser ?? null);

      // Some APIs return only a success message from login.
      if (!currentUser) {
        await getCurrentUser();
      }

      return response.data;
    },
    [getCurrentUser],
  );

  const register = useCallback(async (details) => {
    const response = await api.post("/auth/register", details);
    const currentUser =
      response.data?.data?.user ?? response.data?.user ?? response.data?.data;

    setUser(currentUser ?? null);

    // If registration does not automatically log the user in,
    // the login page can be shown after registration instead.
    return response.data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      setUser(null);
    }
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    login,
    register,
    logout,
    getCurrentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
