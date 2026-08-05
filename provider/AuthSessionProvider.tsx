"use client";

import { SessionProvider } from "next-auth/react";

interface AuthSessionProviderProps {
  children: React.ReactNode;
}

/** Auth.js useSession() — RSC는 auth()/getServerSession 사용 */
export function AuthSessionProvider({ children }: AuthSessionProviderProps) {
  return <SessionProvider>{children}</SessionProvider>;
}
