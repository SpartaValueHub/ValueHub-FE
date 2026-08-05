import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import type { SessionUser } from "@/types/auth/session";

export async function getAuthSession() {
  return getServerSession(authOptions);
}

export type AuthUser = SessionUser;

export async function getAuthUser(): Promise<AuthUser | null> {
  const session = await getAuthSession();
  const user = session?.user;

  if (!user?.memberUuid || !user.nickname) {
    return null;
  }

  return {
    memberUuid: user.memberUuid,
    nickname: user.nickname,
    role: user.role || "USER",
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
