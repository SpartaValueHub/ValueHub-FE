/**
 * PortOne 본인인증 confirm/status 오케스트레이션.
 * confirm 성공 시 반환된 requestToken을 sign-up hidden field에 넣어 auth-service로 전달.
 */
import { confirmIdentityVerification } from "@/lib/api/identity-verification";
import type {
  ApiIdentityVerificationConfirmRequest,
  ApiIdentityVerificationConfirmResponse,
} from "@/types/auth/api";

export async function confirmIdentityVerificationService(
  input: ApiIdentityVerificationConfirmRequest
): Promise<ApiIdentityVerificationConfirmResponse> {
  return confirmIdentityVerification(input);
}
