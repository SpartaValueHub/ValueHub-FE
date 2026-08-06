import { ApiError } from "@/lib/api/client";
import {
  AUTH_SESSION_TERMINATED,
  DuplicateLoginError,
} from "@/lib/auth/duplicate-login";

const IGNORABLE_LOGOUT_CODES = new Set([
  AUTH_SESSION_TERMINATED,
  "INVALID_TOKEN",
  "AUTH_UNAUTHORIZED",
  "AUTH_FORBIDDEN_ORIGIN",
]);

/** 이미 종료·무효화된 세션 logout — 로컬 세션 정리는 계속 진행 */
export function isIgnorableLogoutFailure(error: unknown): boolean {
  if (error instanceof DuplicateLoginError) {
    return true;
  }

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
