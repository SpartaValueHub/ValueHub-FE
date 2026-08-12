import { cookies } from "next/headers";
import { getToken } from "next-auth/jwt";
import { redirect } from "next/navigation";

import type { SessionUser } from "@/types/auth/session";

export type AuthUser = SessionUser;

/**
 * 서버 전용 세션 사용자.
 * memberUuid·role은 JWT token에만 두고 /api/auth/session에는 노출하지 않으므로
 * getServerSession 대신 getToken으로 읽는다.
 */
export async function getAuthUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");

  if (!cookieHeader) {
    return null;
  }

  const token = await getToken({
    req: {
      headers: {
        cookie: cookieHeader,
      },
    } as Parameters<typeof getToken>[0]["req"],
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
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
