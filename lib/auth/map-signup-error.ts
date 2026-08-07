import { ApiError } from "@/lib/api/client";
import type { ActionFailure } from "@/lib/auth/map-action-error";
import { SIGNUP_PARTIAL_SUCCESS_MESSAGE } from "@/lib/auth/signup-partial-success";

const MEMBER_ERROR_MESSAGES: Record<string, string> = {
  MEMBER_AUTH_MISSING: "회원 프로필 저장에 필요한 인증 정보가 없습니다.",
  MEMBER_UUID_REQUIRED: "회원 식별자가 누락되었습니다.",
  MEMBER_UUID_MISMATCH: "인증 정보와 회원 식별자가 일치하지 않습니다.",
  MEMBER_DUPLICATE_UUID: "이미 등록된 회원입니다.",
  MEMBER_DUPLICATE_NICKNAME: "이미 사용 중인 닉네임입니다.",
  INVALID_REQUEST: "회원 프로필 입력값을 확인해 주세요.",
};

type SignupErrorContext = {
  authCreated: boolean;
};

function resolveMemberMessage(error: ApiError, authCreated: boolean): string {
  if (authCreated) {
    return SIGNUP_PARTIAL_SUCCESS_MESSAGE;
  }

  if (error.code && MEMBER_ERROR_MESSAGES[error.code]) {
    return MEMBER_ERROR_MESSAGES[error.code]!;
  }

  return error.message;
}

/** 회원가입 orchestration catch — partial signup·member-service code 구분 */
export function mapSignupError(
  error: unknown,
  context: SignupErrorContext,
  fallbackMessage = "회원가입에 실패했습니다."
): ActionFailure {
  if (error instanceof ApiError) {
    return {
      ok: false,
      partialSuccess: context.authCreated,
      message: resolveMemberMessage(error, context.authCreated),
      code: error.code,
    };
  }

  if (error instanceof Error) {
    return {
      ok: false,
      partialSuccess: context.authCreated,
      message: context.authCreated
        ? SIGNUP_PARTIAL_SUCCESS_MESSAGE
        : error.message,
    };
  }

  return { ok: false, message: fallbackMessage };
}
