import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { getToken } from "next-auth/jwt";
import { redirect } from "next/navigation";

import { getMyAuthAccount } from "@/lib/api/auth";
import { ApiError, AuthSessionExpiredError } from "@/lib/api/client";
import { buildAuthCookieHeader } from "@/lib/auth/cookie-store";
import { clearExpiredAuthSession } from "@/lib/auth/clear-expired-session";
import { isSecureNextAuthCookieEnv } from "@/lib/auth/nextauth-session";
import { authOptions } from "@/lib/auth/options";
import type { ClientSessionUser, SessionUser } from "@/types/auth/session";

export type AuthUser = SessionUser;

function isAuthFailure(error: unknown): boolean {
  return (
    error instanceof AuthSessionExpiredError ||
    (error instanceof ApiError && error.status === 401)
  );
}

/**
 * Auth HttpOnly 쿠키 + `/auth/me`(필요 시 refresh)로 백엔드 세션 생존 확인.
 * 쿠키 삭제는 하지 않음 — RSC에서 cookies().delete 금지. 정리는 Route Handler/Action에서.
 */
async function probeAuthBackendSession(): Promise<
  true | false | "transient"
> {
  const cookieHeader = await buildAuthCookieHeader();
  if (!cookieHeader) {
    return false;
  }

  try {
    await getMyAuthAccount();
    return true;
  } catch (error) {
    if (isAuthFailure(error)) {
      return false;
    }
    return "transient";
  }
}

/**
 * 헤더 등 클라이언트 UI용.
 * NextAuth nickname + Auth 실세션. 쿠키 없음·만료면 null (헤더 비로그인).
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

  const probe = await probeAuthBackendSession();
  if (probe === false) {
    return null;
  }
  // transient: 오로그아웃 방지로 nickname 유지
  return { nickname };
}

/**
 * 서버 전용 세션 사용자 (보호 페이지·Action).
 * NextAuth JWT의 memberUuid·nickname + Auth 백엔드 세션을 함께 확인한다.
 * Auth 쿠키가 없거나 만료면 null (requireAuth → 로그인 리다이렉트).
 */
export async function getAuthUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();

  if (cookieStore.getAll().length === 0) {
    return null;
  }

  const token = await getToken({
    req: {
      cookies: cookieStore,
    } as unknown as Parameters<typeof getToken>[0]["req"],
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

  const probe = await probeAuthBackendSession();
  if (probe === false) {
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

/** RSC/페이지용 — 미로그인·Auth 만료 시 /signin 리다이렉트 */
export async function requireAuth(callbackUrl = "/") {
  const user = await getAuthUser();
  if (!user) {
    redirect(`/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }
  return user;
}

/** Server Action용 — throw (쿠키 정리 가능) */
export async function requireActionAuth(): Promise<AuthUser> {
  const user = await getAuthUser();
  if (!user) {
    await clearExpiredAuthSession();
    throw new AuthSessionExpiredError();
  }
  return user;
}
