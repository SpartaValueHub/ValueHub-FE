import { ApiError } from "@/lib/api/client";
import {
  AUTH_SESSION_TERMINATED,
  DuplicateLoginError,
  isDuplicateLoginActionFailure,
} from "@/lib/auth/duplicate-login";

export type ActionFailure = {
  ok: false;
  message: string;
  code?: string;
};

export { isDuplicateLoginActionFailure };

/** Server Action catch — DuplicateLoginError는 AUTH_SESSION_TERMINATED code로 직렬화 */
export function mapActionError(
  error: unknown,
  fallbackMessage: string
): ActionFailure {
  if (error instanceof DuplicateLoginError) {
    return {
      ok: false,
      message: error.message,
      code: AUTH_SESSION_TERMINATED,
    };
  }

  const message =
    error instanceof ApiError
      ? error.message
      : error instanceof Error
        ? error.message
        : fallbackMessage;

  return { ok: false, message };
}
