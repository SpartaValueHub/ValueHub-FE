"use client";

import React, { createContext, useContext } from "react";

export type SessionUserSummary = {
  uuid: string;
  logInId: string;
  name: string;
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

export const useSession = (): SessionContextType => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionContextProvider");
  }
  return context;
};

export { SessionContext };
