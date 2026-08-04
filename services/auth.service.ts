/**
 * auth-service 오케스트레이션.
 * UI/actions → service → lib/api (3-layer). nickname은 member-service 예정.
 */
import {
  checkEmailAvailability,
  checkLoginIdAvailability,
  logoutUser,
  refreshTokens,
  registerUser,
  signInUser,
} from "@/lib/api/auth";
import type { ApiSignInResponse, ApiSignupResponse } from "@/types/auth/api";
import type { SigninInput } from "@/types/auth/signin";
import type { SignupApiInput } from "@/types/auth/signup";

export async function signupService(
  input: SignupApiInput
): Promise<ApiSignupResponse> {
  // auth-service sign-up: requestToken + credentials만 전송 (실명·전화는 PortOne·서버 조회)
  return registerUser({
    requestToken: input.requestToken,
    logInId: input.logInId,
    password: input.password,
    email: input.email,
  });
}

export async function signInService(
  input: SigninInput
): Promise<ApiSignInResponse> {
  return signInUser({
    logInId: input.logInId,
    password: input.password,
  });
}

export async function refreshSessionService(refreshToken: string) {
  return refreshTokens({ refreshToken });
}

export async function logoutService(accessToken: string, refreshToken: string) {
  // logout은 Gateway JWT 검증 필요 — Bearer accessToken 전달
  await logoutUser({ accessToken, refreshToken }, accessToken);
}

export async function checkLoginIdAvailabilityService(loginId: string) {
  const result = await checkLoginIdAvailability(loginId);
  return result.available;
}

export async function checkEmailAvailabilityService(email: string) {
  const result = await checkEmailAvailability(email);
  return result.available;
}
