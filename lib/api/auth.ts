import { apiFetch } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type {
  ApiAvailabilityResponse,
  ApiSignupRequest,
  ApiSignupResponse,
} from "@/types/auth/api";

/** auth-service HTTP — lib/api/* 전용. UI·actions에서 import 금지. */

export function registerUser(body: ApiSignupRequest) {
  return apiFetch<ApiSignupResponse>(API_ENDPOINTS.auth.signUp, {
    method: "POST",
    body,
    cache: { noStore: true },
    skipSessionRecovery: true,
  });
}

export function logoutUser() {
  return apiFetch<void>(API_ENDPOINTS.auth.logout, {
    method: "POST",
    cache: { noStore: true },
    trustedOrigin: true,
    skipSessionRecovery: true,
  });
}

export function checkLoginIdAvailability(loginId: string) {
  return apiFetch<ApiAvailabilityResponse>(
    API_ENDPOINTS.auth.checkLoginId(loginId),
    { cache: { noStore: true }, skipSessionRecovery: true }
  );
}

export function checkEmailAvailability(email: string) {
  return apiFetch<ApiAvailabilityResponse>(
    API_ENDPOINTS.auth.checkEmail(email),
    { cache: { noStore: true }, skipSessionRecovery: true }
  );
}
