import { ApiError } from "@/lib/api/client";

const IGNORABLE_LOGOUT_CODES = new Set([
  "INVALID_TOKEN",
  "AUTH_UNAUTHORIZED",
  "AUTH_FORBIDDEN_ORIGIN",
]);

/** 이미 종료·무효화된 세션 logout — 로컬 세션 정리는 계속 진행 */
export function isIgnorableLogoutFailure(error: unknown): boolean {
  if (error instanceof ApiError) {
    if (error.status === 401 || error.status === 403) {
      return true;
    }
    if (error.status === 503) {
      return true;
    }
  }

  if (error instanceof Error && error.message) {
    try {
      const body = JSON.parse(error.message) as { code?: string };
      if (body.code && IGNORABLE_LOGOUT_CODES.has(body.code)) {
        return true;
      }
    } catch {
      // not JSON — fall through
    }
  }

  return false;
}
