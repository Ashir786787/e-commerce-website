"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";

type User = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  isVerified: boolean;
  avatar?: string;
  googleId?: string | null;
  authProvider?: string;
};

type AuthContextType = {
  user: User | null;
  isLoggedIn: boolean;
  loading: boolean;
  refreshAuth: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshAuth = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/me", { credentials: "include" });
      const result = await response.json();
      if (response.ok && result.success) {
        setUser(result.data);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/auth/me", { credentials: "include" })
      .then((res) => res.json())
      .then((result) => {
        if (!cancelled) {
          setUser(result.success ? result.data : null);
        }
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoggedIn: !!user,
      loading,
      refreshAuth,
    }),
    [user, loading, refreshAuth]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
