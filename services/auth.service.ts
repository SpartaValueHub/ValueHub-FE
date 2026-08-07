/**
 * auth-service 오케스트레이션.
 * UI/actions → service → lib/api (3-layer).
 */
import {
  checkEmailAvailability,
  checkLoginIdAvailability,
  logoutUser,
  registerUser,
  resumeSignup,
} from "@/lib/api/auth";
import type { ApiSignupResponse } from "@/types/auth/api";
import type { SignupApiInput } from "@/types/auth/signup";

export async function signupService(
  input: SignupApiInput
): Promise<ApiSignupResponse> {
  return registerUser({
    requestToken: input.requestToken,
    logInId: input.logInId,
    password: input.password,
    email: input.email,
  });
}

export function resumeSignupService(input: {
  logInId: string;
  password: string;
  captchaToken?: string;
}) {
  return resumeSignup(input);
}

export async function logoutService() {
  await logoutUser();
}

export async function checkLoginIdAvailabilityService(loginId: string) {
  const result = await checkLoginIdAvailability(loginId);
  return result.available;
}

export async function checkEmailAvailabilityService(email: string) {
  const result = await checkEmailAvailability(email);
  return result.available;
}
