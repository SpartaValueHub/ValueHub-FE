/**
 * 비로그인 동시검색용 세션 ID.
 * Gateway public 목록은 JWT를 안 타므로 X-Member-Uuid가 안 붙음.
 * 로그인 시에는 서버가 NextAuth token의 memberUuid를 X-Member-Uuid로 전달.
 */
export const SEARCH_SESSION_COOKIE = "vh_search_session";

const COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 365;

function isBrowser() {
  return typeof document !== "undefined";
}

function readCookie(name: string): string | undefined {
  if (!isBrowser()) return undefined;
  const prefix = `${name}=`;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(prefix));
  if (!match) return undefined;
  const value = match.slice(prefix.length);
  return value ? decodeURIComponent(value) : undefined;
}

function writeCookie(name: string, value: string) {
  if (!isBrowser()) return;
  const secure =
    typeof window !== "undefined" && window.location.protocol === "https:"
      ? "; Secure"
      : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${COOKIE_MAX_AGE_SEC}; SameSite=Lax${secure}`;
}

/** 클라이언트 — 없으면 UUID 발급 후 쿠키에 저장 */
export function ensureSearchSessionId(): string {
  const existing = readCookie(SEARCH_SESSION_COOKIE)?.trim();
  if (existing) return existing;
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `s-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  writeCookie(SEARCH_SESSION_COOKIE, id);
  return id;
}
