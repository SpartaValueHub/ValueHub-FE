"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

import {
  SessionContext,
  type SessionUserSummary,
} from "@/context/SessionContext";

interface SessionContextProviderProps {
  children: React.ReactNode;
}

export function SessionContextProvider({
  children,
}: SessionContextProviderProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<SessionUserSummary | null>(null);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/status", { cache: "no-store" });
      if (!response.ok) {
        setIsAuthenticated(false);
        setUser(null);
        return;
      }
      const data = (await response.json()) as {
        isAuthenticated: boolean;
        user: SessionUserSummary | null;
      };
      setIsAuthenticated(!!data.isAuthenticated);
      setUser(data.user);
    } catch (error) {
      console.error("Auth status check failed:", error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = () => {
    router.push("/signin");
  };

  const logout = async () => {
    await signOut({ redirect: false });
    setIsAuthenticated(false);
    setUser(null);
    router.push("/");
    router.refresh();
  };

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <SessionContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        login,
        logout,
        refresh,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}
