import { ApiError } from "@/lib/api/client";

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
  const message =
    error instanceof ApiError
      ? error.message
      : error instanceof Error
        ? error.message
        : fallbackMessage;

  return { ok: false, message };
}
