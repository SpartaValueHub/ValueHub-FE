import { apiFetch, apiTimeoutFromEnv } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type {
  ApiIdentityVerificationConfirmRequest,
  ApiIdentityVerificationConfirmResponse,
} from "@/types/auth/api";

/** PortOne 본인인증 — confirm 후 requestToken을 sign-up에 사용 */

export function confirmIdentityVerification(
  body: ApiIdentityVerificationConfirmRequest
) {
  return apiFetch<ApiIdentityVerificationConfirmResponse>(
    API_ENDPOINTS.identityVerification.confirm,
    {
      method: "POST",
      body,
      cache: { noStore: true },
      timeoutMillis: apiTimeoutFromEnv(
        "IDENTITY_CONFIRM_TIMEOUT_MILLIS",
        12_000
      ),
    }
  );
}
