import { ApiError } from "@/lib/api/client";
import type { ActionFailure } from "@/lib/auth/map-action-error";
import {
  buildAuthorizeErrorPayload,
  signInErrorMessage,
  type SignInErrorCode,
} from "@/lib/auth/signin-errors";
import { SIGNUP_PARTIAL_SUCCESS_MESSAGE } from "@/lib/auth/signup-partial-success";

const MEMBER_ERROR_MESSAGES: Record<string, string> = {
  MEMBER_AUTH_MISSING: "회원 프로필 저장에 필요한 인증 정보가 없습니다.",
  MEMBER_UUID_REQUIRED: "회원 식별자가 누락되었습니다.",
  MEMBER_UUID_MISMATCH: "인증 정보와 회원 식별자가 일치하지 않습니다.",
  MEMBER_DUPLICATE_UUID: "이미 등록된 회원입니다.",
  MEMBER_DUPLICATE_NICKNAME: "이미 사용 중인 닉네임입니다.",
  INVALID_REQUEST: "회원 프로필 입력값을 확인해 주세요.",
};

const LOGIN_POLICY_CODES = new Set<string>([
  "AUTH_UNAUTHORIZED",
  "AUTH_CAPTCHA_REQUIRED",
  "AUTH_CAPTCHA_INVALID",
  "AUTH_CAPTCHA_PROVIDER_UNAVAILABLE",
  "AUTH_ACCOUNT_LOCKED",
  "AUTH_RATE_LIMITED",
  "AUTH_MEMBER_NOT_ACTIVE",
]);

type SignupErrorContext = {
  /** auth 단계가 이번 요청에서 성공했는지 (member 실패 시에만 true) */
  authStepSucceeded: boolean;
  /** 이전 partialSuccess 또는 명시적 resume 모드 — UI 복구 상태 유지 */
  keepPartialSuccess: boolean;
};

function resolveMemberMessage(
  error: ApiError,
  authStepSucceeded: boolean
): string {
  if (authStepSucceeded) {
    return SIGNUP_PARTIAL_SUCCESS_MESSAGE;
  }

  if (error.code && MEMBER_ERROR_MESSAGES[error.code]) {
    return MEMBER_ERROR_MESSAGES[error.code]!;
  }

  return error.message;
}

function mapLoginPolicyError(
  error: ApiError,
  keepPartialSuccess: boolean
): ActionFailure {
  const parsed = buildAuthorizeErrorPayload(error.status, {
    timestamp: "",
    status: error.status,
    code: error.code ?? "AUTH_UNAUTHORIZED",
    message: error.message,
    path: "",
    ...(error.retryAfterSeconds !== undefined
      ? { retryAfterSeconds: error.retryAfterSeconds }
      : {}),
  });

  return {
    ok: false,
    partialSuccess: keepPartialSuccess,
    message: signInErrorMessage(parsed),
    code: parsed.code as SignInErrorCode | string,
    ...(parsed.retryAfterSeconds !== undefined
      ? { retryAfterSeconds: parsed.retryAfterSeconds }
      : {}),
  };
}

/** 회원가입 orchestration catch — partial signup·member-service·login policy code 구분 */
export function mapSignupError(
  error: unknown,
  context: SignupErrorContext,
  fallbackMessage = "회원가입에 실패했습니다."
): ActionFailure {
  if (error instanceof ApiError) {
    if (error.code && LOGIN_POLICY_CODES.has(error.code)) {
      return mapLoginPolicyError(error, context.keepPartialSuccess);
    }

    return {
      ok: false,
      partialSuccess: context.authStepSucceeded || context.keepPartialSuccess,
      message: resolveMemberMessage(error, context.authStepSucceeded),
      code: error.code,
      ...(error.retryAfterSeconds !== undefined
        ? { retryAfterSeconds: error.retryAfterSeconds }
        : {}),
    };
  }

  if (error instanceof Error) {
    return {
      ok: false,
      partialSuccess: context.authStepSucceeded || context.keepPartialSuccess,
      message: context.authStepSucceeded
        ? SIGNUP_PARTIAL_SUCCESS_MESSAGE
        : error.message,
    };
  }

  return { ok: false, message: fallbackMessage };
}
