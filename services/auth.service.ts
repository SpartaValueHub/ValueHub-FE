import { registerUser, signInUser } from "@/lib/api/auth";
import type { ApiSignInResponse, ApiSignupResponse } from "@/types/auth/api";
import type { SigninInput } from "@/types/auth/signin";
import type { SignupInput } from "@/types/auth/signup";

export async function signupService(
  input: Omit<SignupInput, "passwordConfirm">
): Promise<ApiSignupResponse> {
  return registerUser({
    logInId: input.logInId,
    password: input.password,
    email: input.email,
    name: input.name,
    phone: input.phone,
  });
}

function normalizeSignInResponse(raw: unknown): ApiSignInResponse {
  const body = raw as Record<string, unknown> | null;
  const data =
    body && typeof body === "object" && "data" in body
      ? (body.data as Record<string, unknown>)
      : body;

  if (!data || typeof data !== "object") {
    throw new Error("로그인 응답이 올바르지 않습니다.");
  }

  const accessToken = String(data.accessToken ?? "");
  const userId = String(data.userId ?? data.uuid ?? "");
  const logInId = String(data.logInId ?? data.loginId ?? "");
  const name = String(data.name ?? logInId);

  if (!accessToken || !userId) {
    throw new Error("로그인 토큰 또는 사용자 정보가 없습니다.");
  }

  return {
    accessToken,
    refreshToken:
      data.refreshToken != null ? String(data.refreshToken) : undefined,
    userId,
    logInId,
    name,
    email: data.email != null ? String(data.email) : undefined,
  };
}

/** POST /api/v1/auth/sign-in */
export async function signInService(
  input: SigninInput
): Promise<ApiSignInResponse> {
  const raw = await signInUser({
    logInId: input.logInId,
    password: input.password,
  });

  console.log(
    "[sign-in] raw response:\n",
    JSON.stringify(raw, null, 2)
  );

  const normalized = normalizeSignInResponse(raw);

  console.log(
    "[sign-in] normalized response:\n",
    JSON.stringify(normalized, null, 2)
  );

  return normalized;
}
