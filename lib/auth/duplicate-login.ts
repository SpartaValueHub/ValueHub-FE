import type { ApiErrorResponse } from "@/types/auth/api";

/** auth-service·Gateway — 다른 기기 로그인으로 세션 종료 (전용 코드) */
export const AUTH_SESSION_TERMINATED = "AUTH_SESSION_TERMINATED";

export const DUPLICATE_LOGIN_REFRESH_ERROR_CODES = [
  AUTH_SESSION_TERMINATED,
] as const;

export type DuplicateLoginRefreshErrorCode =
  (typeof DUPLICATE_LOGIN_REFRESH_ERROR_CODES)[number];

export class DuplicateLoginError extends Error {
  constructor(
    message = "다른 기기에서 로그인하여 현재 세션이 종료되었습니다."
  ) {
    super(message);
    this.name = "DuplicateLoginError";
  }
}

export function isDuplicateLoginActionFailure(result: {
  ok: boolean;
  code?: string;
}): boolean {
  return !result.ok && result.code === AUTH_SESSION_TERMINATED;
}

/** 서버 duplicate login 플래그 Cookie 이름 */
export const DUPLICATE_LOGIN_COOKIE = "vh_duplicate_login";

export function getJwtExpiryEpochSeconds(token: string): number | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(
      typeof atob !== "undefined"
        ? atob(base64)
        : Buffer.from(base64, "base64").toString("utf8")
    ) as { exp?: unknown };

    return typeof payload.exp === "number" ? payload.exp : null;
  } catch {
    return null;
  }
}

export function isJwtExpired(token: string, nowMs = Date.now()): boolean {
  const exp = getJwtExpiryEpochSeconds(token);
  if (exp === null) return true;
  return exp * 1000 <= nowMs;
}

/** refresh·session probe 실패가 duplicate login(AUTH_SESSION_TERMINATED)인지 판별 */
export function isDuplicateLoginRefreshFailure(
  status: number,
  body: Pick<ApiErrorResponse, "code"> | null | undefined
): boolean {
  if (status !== 401) {
    return false;
  }

  const code = body?.code;
  return (
    code !== undefined &&
    DUPLICATE_LOGIN_REFRESH_ERROR_CODES.includes(
      code as DuplicateLoginRefreshErrorCode
    )
  );
}
