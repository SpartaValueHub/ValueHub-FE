import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { getToken } from "next-auth/jwt";
import { redirect } from "next/navigation";

import { isSecureNextAuthCookieEnv } from "@/lib/auth/nextauth-session";
import { authOptions } from "@/lib/auth/options";
import type { ClientSessionUser, SessionUser } from "@/types/auth/session";

export type AuthUser = SessionUser;

/**
 * 헤더 등 클라이언트 UI용.
 * /api/auth/session과 같은 getServerSession을 써서 nickname만 읽는다.
 */
export async function getClientSessionUser(): Promise<ClientSessionUser | null> {
  const session = await getServerSession(authOptions);
  const nickname =
    typeof session?.user?.nickname === "string"
      ? session.user.nickname.trim()
      : "";

  if (!nickname) {
    return null;
  }

  return { nickname };
}

/**
 * 서버 전용 세션 사용자.
 * memberUuid·role은 JWT token에만 두고 /api/auth/session에는 노출하지 않으므로
 * getServerSession 대신 getToken으로 읽는다.
 *
 * next-auth SessionStore는 req.cookies만 본다. Cookie 헤더 문자열만 넘기면
 * 토큰이 항상 null이 되어 헤더가 비로그인으로 남는다.
 */
export async function getAuthUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();

  if (cookieStore.getAll().length === 0) {
    return null;
  }

  const token = await getToken({
    req: {
      cookies: cookieStore,
    } as Parameters<typeof getToken>[0]["req"],
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
    secureCookie: isSecureNextAuthCookieEnv(),
  });

  const memberUuid =
    typeof token?.memberUuid === "string" ? token.memberUuid.trim() : "";
  const nickname =
    typeof token?.nickname === "string" ? token.nickname.trim() : "";

  if (!memberUuid || !nickname) {
    return null;
  }

  return {
    memberUuid,
    nickname,
    role:
      typeof token?.role === "string" && token.role.trim()
        ? token.role.trim()
        : "USER",
  };
}

/** RSC/페이지용 — 미로그인 시 /signin 리다이렉트 */
export async function requireAuth(callbackUrl = "/") {
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
