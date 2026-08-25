import { SESSION_EXPIRED_CODE } from "@/constants/auth-session";
import { ApiError, AuthSessionExpiredError } from "@/lib/api/client";

export type ActionFailure = {
  ok: false;
  message: string;
  code?: string;
  partialSuccess?: boolean;
  retryAfterSeconds?: number;
};

/** Server Action catch — ApiError·Error를 ActionFailure로 변환 */
export function mapActionError(
  error: unknown,
  fallbackMessage: string
): ActionFailure {
  if (error instanceof AuthSessionExpiredError) {
    return {
      ok: false,
      message: error.message,
      code: SESSION_EXPIRED_CODE,
    };
  }

  if (error instanceof ApiError) {
    return {
      ok: false,
      message: error.message,
      code: error.code,
      retryAfterSeconds: error.retryAfterSeconds,
    };
  }

  const message = error instanceof Error ? error.message : fallbackMessage;

  return { ok: false, message };
}
