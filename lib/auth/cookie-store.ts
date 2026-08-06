import { cookies } from "next/headers";

import {
  AUTH_COOKIE_ACCESS,
  AUTH_COOKIE_REFRESH,
  parseSetCookie,
} from "@/lib/auth/cookies";
import { DUPLICATE_LOGIN_COOKIE } from "@/lib/auth/duplicate-login";

/** fetch Response Set-Cookie → Next.js cookie store */
export async function applyResponseCookies(res: Response) {
  const setCookies =
    typeof res.headers.getSetCookie === "function"
      ? res.headers.getSetCookie()
      : [];

  if (setCookies.length === 0) {
    const single = res.headers.get("set-cookie");
    if (single) setCookies.push(single);
  }

  const store = await cookies();
  for (const header of setCookies) {
    const parsed = parseSetCookie(header);
    if (!parsed) continue;

    store.set(parsed.name, parsed.value, {
      httpOnly: parsed.httpOnly ?? true,
      secure: parsed.secure ?? process.env.NODE_ENV === "production",
      sameSite: parsed.sameSite ?? "lax",
      path: parsed.path ?? "/",
      ...(parsed.domain ? { domain: parsed.domain } : {}),
      ...(parsed.maxAge !== undefined ? { maxAge: parsed.maxAge } : {}),
    });
  }
}

export async function buildAuthCookieHeader(): Promise<string | undefined> {
  const store = await cookies();
  const parts: string[] = [];

  const access = store.get(AUTH_COOKIE_ACCESS)?.value;
  const refresh = store.get(AUTH_COOKIE_REFRESH)?.value;

  if (access) parts.push(`${AUTH_COOKIE_ACCESS}=${access}`);
  if (refresh) parts.push(`${AUTH_COOKIE_REFRESH}=${refresh}`);

  return parts.length > 0 ? parts.join("; ") : undefined;
}

export async function clearAuthCookies() {
  const store = await cookies();
  store.delete({ name: AUTH_COOKIE_ACCESS, path: "/" });
  store.delete({ name: AUTH_COOKIE_REFRESH, path: "/" });
  // 이전 refresh-path(/api/v1/auth) 고아 쿠키 정리
  store.delete({ name: AUTH_COOKIE_REFRESH, path: "/api/v1/auth" });
}

export async function getRefreshTokenValue(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(AUTH_COOKIE_REFRESH)?.value;
}

/** apiFetch refresh 실패(duplicate login) — session-event·focus fallback용 HttpOnly 플래그 */
export async function markDuplicateLoginDetected() {
  const store = await cookies();
  store.set(DUPLICATE_LOGIN_COOKIE, "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 300,
  });
}

export async function hasDuplicateLoginFlag(): Promise<boolean> {
  const store = await cookies();
  return store.get(DUPLICATE_LOGIN_COOKIE)?.value === "1";
}

export async function clearDuplicateLoginFlag() {
  const store = await cookies();
  store.delete({ name: DUPLICATE_LOGIN_COOKIE, path: "/" });
}

/** HttpOnly access·refresh Cookie 존재 여부 — NextAuth 세션과 무관 */
export async function hasSessionMaterial(): Promise<boolean> {
  const store = await cookies();
  const access = store.get(AUTH_COOKIE_ACCESS)?.value;
  const refresh = store.get(AUTH_COOKIE_REFRESH)?.value;
  return Boolean(access || refresh);
}
