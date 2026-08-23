"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

import {
  SessionContext,
  type SessionUserSummary,
} from "@/context/SessionContext";
import { SESSION_EXPIRED_EVENT } from "@/lib/auth/session-expired.client";
import { logSafeError } from "@/lib/log/safe-log";

export type InitialSession = {
  isAuthenticated: boolean;
  user: SessionUserSummary | null;
};

interface SessionContextProviderProps {
  children: React.ReactNode;
  initialSession: InitialSession;
}

export function SessionContextProvider({
  children,
  initialSession,
}: SessionContextProviderProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(
    initialSession.isAuthenticated
  );
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<SessionUserSummary | null>(
    initialSession.user
  );

  const expireSessionLocally = useCallback(async () => {
    setIsAuthenticated(false);
    setUser(null);
    try {
      await signOut({ redirect: false });
    } catch (error) {
      logSafeError("Local session expire signOut failed:", error);
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/status", {
        cache: "no-store",
        credentials: "include",
      });
      if (!response.ok) {
        setIsAuthenticated(false);
        setUser(null);
        return;
      }
      const data = (await response.json()) as {
        isAuthenticated: boolean;
        user: SessionUserSummary | null;
      };
      const nextAuth = !!data.isAuthenticated;
      setIsAuthenticated(nextAuth);
      setUser(data.user);
      if (!nextAuth) {
        try {
          await signOut({ redirect: false });
        } catch (error) {
          logSafeError("Session refresh signOut failed:", error);
        }
      }
    } catch (error) {
      logSafeError("Auth status check failed:", error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(() => {
    router.push("/signin");
  }, [router]);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      logSafeError("Backend logout failed:", error);
    }
    await signOut({ redirect: false });
    setIsAuthenticated(false);
    setUser(null);
    router.push("/");
    router.refresh();
  }, [router]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refresh();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [refresh]);

  useEffect(() => {
    function onExpired() {
      void expireSessionLocally();
    }
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
  }, [expireSessionLocally]);

  const value = useMemo(
    () => ({
      isAuthenticated,
      isLoading,
      user,
      login,
      logout,
      refresh,
      expireSession: expireSessionLocally,
    }),
    [
      isAuthenticated,
      isLoading,
      user,
      login,
      logout,
      refresh,
      expireSessionLocally,
    ]
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}
