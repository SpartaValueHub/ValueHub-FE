/**
 * auth-service 오케스트레이션.
 * UI/actions → service → lib/api (3-layer).
 */
import {
  checkEmailAvailability,
  checkLoginIdAvailability,
  getMemberJoinedAt,
  getMyAuthAccount,
  logoutUser,
  registerUser,
  resumeSignup,
  withdrawMember,
} from "@/lib/api/auth";
import type { ApiAuthAccountResponse, ApiSignupResponse } from "@/types/auth/api";
import type { SignupApiInput } from "@/types/auth/signup";
import type { UiAuthAccount } from "@/types/auth/ui";

function mapAuthAccount(response: ApiAuthAccountResponse): UiAuthAccount {
  return {
    logInId: response.logInId,
    email: response.email,
    phoneNumber: response.phoneNumber,
    joinedAt: response.joinedAt,
  };
}

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

export async function getMyAuthAccountService(): Promise<UiAuthAccount> {
  const response = await getMyAuthAccount();
  return mapAuthAccount(response);
}

/** 타인 가입일 ISO — 프로필 모달용 (Gateway public) */
export async function getMemberJoinedAtService(
  memberUuid: string
): Promise<{ memberUuid: string; joinedAt: string }> {
  const response = await getMemberJoinedAt(memberUuid);
  return {
    memberUuid: response.memberUuid,
    joinedAt: response.joinedAt,
  };
}

export async function withdrawMemberService(requestToken: string): Promise<void> {
  await withdrawMember({ requestToken });
}
