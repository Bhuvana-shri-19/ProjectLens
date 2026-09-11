"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import axios from "axios";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  authProvider?: "local" | "google";
}

interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  error?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  loginWithGoogle: (credential: string) => Promise<{ success: boolean; error?: string }>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.error || error.message || fallback;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Restore session from localStorage and verify with backend
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem("projectlens_token");
        const storedUser = localStorage.getItem("projectlens_user");

        if (storedToken) {
          setToken(storedToken);
          if (storedUser) {
            try {
              setUser(JSON.parse(storedUser) as User);
            } catch {
              // Ignore parse error
            }
          }

          // Verify token and fetch fresh user profile from backend
          try {
            const response = await axios.get<{ success: boolean; user: User }>(
              `${API_BASE_URL}/api/auth/me`,
              {
                headers: {
                  Authorization: `Bearer ${storedToken}`,
                },
                timeout: 5000,
              }
            );

            if (response.data?.success && response.data?.user) {
              setUser(response.data.user);
              localStorage.setItem("projectlens_user", JSON.stringify(response.data.user));
            }
          } catch (err: unknown) {
            if (axios.isAxiosError(err) && err.response?.status === 401) {
              localStorage.removeItem("projectlens_token");
              localStorage.removeItem("projectlens_user");
              setToken(null);
              setUser(null);
            }
          }
        }
      } catch (err) {
        console.error("Failed to initialize authentication state:", err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const saveAuthSession = (authToken: string, authUser: User) => {
    setToken(authToken);
    setUser(authUser);
    localStorage.setItem("projectlens_token", authToken);
    localStorage.setItem("projectlens_user", JSON.stringify(authUser));
  };

  const loginWithGoogle = useCallback(async (credential: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      const response = await axios.post<AuthResponse>(
        `${API_BASE_URL}/api/auth/google`,
        { credential },
        {
          headers: { "Content-Type": "application/json" },
          timeout: 10000,
        }
      );

      if (response.data.success && response.data.token && response.data.user) {
        saveAuthSession(response.data.token, response.data.user);
        return { success: true };
      }

      return {
        success: false,
        error: response.data.error || "Google sign-in failed. Please try again.",
      };
    } catch (err: unknown) {
      return { success: false, error: getErrorMessage(err, "Unable to connect to authentication server.") };
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      const response = await axios.post<AuthResponse>(
        `${API_BASE_URL}/api/auth/login`,
        { email, password },
        {
          headers: { "Content-Type": "application/json" },
          timeout: 10000,
        }
      );

      if (response.data.success && response.data.token && response.data.user) {
        saveAuthSession(response.data.token, response.data.user);
        return { success: true };
      }

      return {
        success: false,
        error: response.data.error || "Login failed. Please check your credentials.",
      };
    } catch (err: unknown) {
      return { success: false, error: getErrorMessage(err, "Login failed. Please try again.") };
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      const response = await axios.post<AuthResponse>(
        `${API_BASE_URL}/api/auth/register`,
        { name, email, password },
        {
          headers: { "Content-Type": "application/json" },
          timeout: 10000,
        }
      );

      if (response.data.success && response.data.token && response.data.user) {
        saveAuthSession(response.data.token, response.data.user);
        return { success: true };
      }

      return {
        success: false,
        error: response.data.error || "Registration failed. Please try again.",
      };
    } catch (err: unknown) {
      return { success: false, error: getErrorMessage(err, "Registration failed. Please try again.") };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("projectlens_token");
    localStorage.removeItem("projectlens_user");
    setToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((userData: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...userData };
      localStorage.setItem("projectlens_user", JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        loginWithGoogle,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
