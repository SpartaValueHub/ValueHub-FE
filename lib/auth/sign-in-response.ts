import type { ApiSignInResponse } from "@/types/auth/api";

type SignInResponseLike = Partial<ApiSignInResponse> & {
  authUuid?: string;
};

/** sign-in body — BE memberUuid·구버전 authUuid·signup authUuid fallback */
export function normalizeSignInResponse(
  response: SignInResponseLike,
  fallbackAuthUuid?: string
): ApiSignInResponse {
  const memberUuid =
    response.memberUuid?.trim() ||
    response.authUuid?.trim() ||
    fallbackAuthUuid?.trim() ||
    "";

  if (!memberUuid) {
    throw new Error("로그인 응답에 회원 식별자가 없습니다.");
  }

  return {
    memberUuid,
    nickname: response.nickname?.trim() ?? "",
    role: response.role?.trim() || "USER",
  };
}
