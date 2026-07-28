import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";

export async function getAuthSession() {
  return getServerSession(authOptions);
}

export type AuthUser = {
  accessToken: string;
  refreshToken?: string;
  uuid: string;
  logInId: string;
  name: string;
};

/** 서버 로그용 — NextAuth session + AuthUser 상세 출력 */
export async function logAuthSessionDetail(label: string) {
  const session = await getAuthSession();
  const user = session?.user;

  const detail = {
    label,
    at: new Date().toISOString(),
    hasSession: Boolean(session),
    expires: session?.expires ?? null,
    sessionUser: user
      ? {
          name: user.name ?? null,
          email: user.email ?? null,
          image: user.image ?? null,
          uuid: user.uuid ?? null,
          logInId: user.logInId ?? null,
          accessToken: user.accessToken ?? null,
          accessTokenLength: user.accessToken?.length ?? 0,
          refreshToken: user.refreshToken ?? null,
          refreshTokenLength: user.refreshToken?.length ?? 0,
        }
      : null,
    rawSession: session,
  };

  console.log(`[session] ${label}\n`, JSON.stringify(detail, null, 2));
}

export async function getAuthUser(): Promise<AuthUser | null> {
  const session = await getAuthSession();
  const user = session?.user;

  if (!user?.accessToken || !user.uuid) {
    return null;
  }

  return {
    accessToken: user.accessToken,
    refreshToken: user.refreshToken,
    uuid: user.uuid,
    logInId: user.logInId,
    name: user.name,
  };
}

/** RSC/페이지용 — 미로그인 시 /signin 리다이렉트 */
export async function requireAuth(callbackUrl = "/chat") {
  const user = await getAuthUser();
  if (!user) {
    redirect(`/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }
  return user;
}

/** Server Action용 — throw */
export async function requireActionAuth(): Promise<AuthUser> {
  const user = await getAuthUser();
  if (!user) {
    throw new Error("로그인이 필요합니다.");
  }
  return user;
}
