/**
 * PortOne 본인인증 confirm/status 오케스트레이션.
 * confirm 성공 시 반환된 requestToken을 sign-up hidden field에 넣어 auth-service로 전달.
 */
import {
  confirmIdentityVerification,
  getIdentityVerificationStatus,
} from "@/lib/api/identity-verification";
import type {
  ApiIdentityVerificationConfirmRequest,
  ApiIdentityVerificationResponse,
} from "@/types/auth/api";

export async function confirmIdentityVerificationService(
  input: ApiIdentityVerificationConfirmRequest
): Promise<ApiIdentityVerificationResponse> {
  return confirmIdentityVerification(input);
}

export async function getIdentityVerificationStatusService(
  requestToken: string
): Promise<ApiIdentityVerificationResponse> {
  return getIdentityVerificationStatus(requestToken);
}
