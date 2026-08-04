import { apiFetch } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type {
  ApiIdentityVerificationConfirmRequest,
  ApiIdentityVerificationResponse,
} from "@/types/auth/api";

/** PortOne 본인인증 — confirm 후 requestToken을 sign-up에 사용 */

export function confirmIdentityVerification(
  body: ApiIdentityVerificationConfirmRequest
) {
  return apiFetch<ApiIdentityVerificationResponse>(
    API_ENDPOINTS.identityVerification.confirm,
    {
      method: "POST",
      body,
      cache: { noStore: true },
    }
  );
}

export function getIdentityVerificationStatus(requestToken: string) {
  return apiFetch<ApiIdentityVerificationResponse>(
    API_ENDPOINTS.identityVerification.status(requestToken),
    { cache: { noStore: true } }
  );
}
