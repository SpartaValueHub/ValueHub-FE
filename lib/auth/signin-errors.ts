import type { ApiErrorResponse } from "@/types/auth/api";

export type SignInErrorCode =
  | "AUTH_UNAUTHORIZED"
  | "AUTH_CAPTCHA_REQUIRED"
  | "AUTH_CAPTCHA_INVALID"
  | "AUTH_ACCOUNT_LOCKED"
  | "AUTH_RATE_LIMITED"
  | "AUTH_MEMBER_NOT_ACTIVE"
  | "CredentialsSignin";

export type ParsedSignInError = {
  code: SignInErrorCode;
  message: string;
  retryAfterSeconds?: number;
};

const ACCOUNT_LOCKED_FALLBACK =
  "로그인이 일시적으로 제한되었습니다. 잠시 후 다시 시도해 주세요.";

const RATE_LIMITED_FALLBACK =
  "로그인 요청이 많습니다. 잠시 후 다시 시도해 주세요.";

const SIGN_IN_ERROR_MESSAGES: Record<
  Exclude<SignInErrorCode, "CredentialsSignin">,
  string
> = {
  AUTH_UNAUTHORIZED: "아이디 또는 비밀번호가 올바르지 않습니다.",
  AUTH_CAPTCHA_REQUIRED: "로그인 시도가 많습니다. 보안 확인을 완료해 주세요.",
  AUTH_CAPTCHA_INVALID: "보안 확인에 실패했습니다. 다시 시도해 주세요.",
  AUTH_ACCOUNT_LOCKED: ACCOUNT_LOCKED_FALLBACK,
  AUTH_RATE_LIMITED: RATE_LIMITED_FALLBACK,
  AUTH_MEMBER_NOT_ACTIVE: "현재 로그인할 수 없는 계정입니다.",
};

function formatRetryAfterMessage(
  retryAfterSeconds: number | undefined,
  fallback: string,
  timedPrefix: string
): string {
  if (
    retryAfterSeconds === undefined ||
    !Number.isFinite(retryAfterSeconds) ||
    retryAfterSeconds <= 0
  ) {
    return fallback;
  }

  const seconds = Math.ceil(retryAfterSeconds);

  if (seconds >= 60) {
    const minutes = Math.ceil(seconds / 60);
    return `${timedPrefix} ${minutes}분 후 다시 시도해 주세요.`;
  }

  return `${timedPrefix} ${seconds}초 후 다시 시도해 주세요.`;
}

export function formatAccountLockedMessage(retryAfterSeconds?: number): string {
  return formatRetryAfterMessage(
    retryAfterSeconds,
    ACCOUNT_LOCKED_FALLBACK,
    "로그인이 일시적으로 제한되었습니다."
  );
}

export function formatRateLimitedMessage(retryAfterSeconds?: number): string {
  return formatRetryAfterMessage(
    retryAfterSeconds,
    RATE_LIMITED_FALLBACK,
    "로그인 요청이 많습니다."
  );
}

const KNOWN_CODES = new Set<string>(Object.keys(SIGN_IN_ERROR_MESSAGES));

function defaultUnauthorized(): ParsedSignInError {
  return {
    code: "AUTH_UNAUTHORIZED",
    message: SIGN_IN_ERROR_MESSAGES.AUTH_UNAUTHORIZED,
  };
}

function tryDecode(value: string): string {
  if (!value.includes("%")) {
    return value;
  }
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function isKnownCode(
  code: string
): code is Exclude<SignInErrorCode, "CredentialsSignin"> {
  return KNOWN_CODES.has(code);
}

function fromCode(
  code: string,
  fallbackMessage?: string,
  retryAfterSeconds?: number
): ParsedSignInError {
  if (isKnownCode(code)) {
    return {
      code,
      message: SIGN_IN_ERROR_MESSAGES[code],
      ...(retryAfterSeconds !== undefined ? { retryAfterSeconds } : {}),
    };
  }

  if (fallbackMessage && !looksLikeInternalError(fallbackMessage)) {
    return {
      code: "AUTH_UNAUTHORIZED",
      message: fallbackMessage,
      ...(retryAfterSeconds !== undefined ? { retryAfterSeconds } : {}),
    };
  }

  return defaultUnauthorized();
}

function looksLikeInternalError(value: string): boolean {
  const trimmed = value.trim();
  return (
    trimmed.startsWith("{") ||
    trimmed.startsWith("AUTH_") ||
    trimmed === "CredentialsSignin"
  );
}

export function buildAuthorizeErrorPayload(
  status: number,
  body: ApiErrorResponse | null
): ParsedSignInError {
  if (body?.code && isKnownCode(body.code)) {
    return fromCode(body.code, body.message, body.retryAfterSeconds);
  }

  if (body?.code) {
    return fromCode(body.code, body.message, body.retryAfterSeconds);
  }

  if (status === 429) {
    return {
      code: "AUTH_RATE_LIMITED",
      message: SIGN_IN_ERROR_MESSAGES.AUTH_RATE_LIMITED,
      ...(body?.retryAfterSeconds !== undefined
        ? { retryAfterSeconds: body.retryAfterSeconds }
        : {}),
    };
  }

  if (status === 423) {
    return {
      code: "AUTH_ACCOUNT_LOCKED",
      message: SIGN_IN_ERROR_MESSAGES.AUTH_ACCOUNT_LOCKED,
      ...(body?.retryAfterSeconds !== undefined
        ? { retryAfterSeconds: body.retryAfterSeconds }
        : {}),
    };
  }

  if (status === 401) {
    return defaultUnauthorized();
  }

  return defaultUnauthorized();
}

export function parseSignInError(raw: string | undefined): ParsedSignInError {
  if (!raw) {
    return defaultUnauthorized();
  }

  const normalized = tryDecode(raw.trim());

  if (normalized === "CredentialsSignin") {
    return defaultUnauthorized();
  }

  if (isKnownCode(normalized)) {
    return fromCode(normalized);
  }

  try {
    const parsed = JSON.parse(normalized) as {
      code?: string;
      message?: string;
      retryAfterSeconds?: number;
    };
    if (parsed.code) {
      return fromCode(parsed.code, parsed.message, parsed.retryAfterSeconds);
    }
  } catch {
    // NextAuth 기본 CredentialsSignin 또는 plain code 문자열
  }

  if (looksLikeInternalError(normalized)) {
    return defaultUnauthorized();
  }

  return defaultUnauthorized();
}

export function signInErrorMessage(error: ParsedSignInError): string {
  if (error.code === "AUTH_ACCOUNT_LOCKED") {
    return formatAccountLockedMessage(error.retryAfterSeconds);
  }

  if (error.code === "AUTH_RATE_LIMITED") {
    return formatRateLimitedMessage(error.retryAfterSeconds);
  }

  if (error.message && !looksLikeInternalError(error.message)) {
    return error.message;
  }

  if (isKnownCode(error.code)) {
    return SIGN_IN_ERROR_MESSAGES[error.code];
  }

  return SIGN_IN_ERROR_MESSAGES.AUTH_UNAUTHORIZED;
}

export function isCaptchaRequiredError(error: ParsedSignInError): boolean {
  return error.code === "AUTH_CAPTCHA_REQUIRED";
}
