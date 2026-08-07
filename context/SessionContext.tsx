"use client";

import { createContext, useContext } from "react";

/** 클라이언트 노출용 — nickname만 (memberUuid·role 미포함) */
export type SessionUserSummary = {
  nickname: string;
};

interface SessionContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: SessionUserSummary | null;
  login: () => void;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const useAppSession = (): SessionContextType => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error(
      "useAppSession must be used within a SessionContextProvider"
    );
  }
  return context;
};

export { SessionContext };
