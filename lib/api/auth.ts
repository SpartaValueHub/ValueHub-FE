import { apiFetch } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type {
  ApiAvailabilityResponse,
  ApiLogoutRequest,
  ApiRefreshRequest,
  ApiSignInRequest,
  ApiSignInResponse,
  ApiSignupRequest,
  ApiSignupResponse,
} from "@/types/auth/api";

/** auth-service HTTP — lib/api/* 전용. UI·actions에서 import 금지. */

export function registerUser(body: ApiSignupRequest) {
  return apiFetch<ApiSignupResponse>(API_ENDPOINTS.auth.signUp, {
    method: "POST",
    body,
    cache: { noStore: true },
  });
}

export function signInUser(body: ApiSignInRequest) {
  return apiFetch<ApiSignInResponse>(API_ENDPOINTS.auth.signIn, {
    method: "POST",
    body,
    cache: { noStore: true },
  });
}

export function refreshTokens(body: ApiRefreshRequest) {
  return apiFetch<ApiSignInResponse>(API_ENDPOINTS.auth.refresh, {
    method: "POST",
    body,
    cache: { noStore: true },
  });
}

export function logoutUser(body: ApiLogoutRequest, accessToken: string) {
  return apiFetch<void>(API_ENDPOINTS.auth.logout, {
    method: "POST",
    body,
    accessToken,
    cache: { noStore: true },
  });
}

export function checkLoginIdAvailability(loginId: string) {
  return apiFetch<ApiAvailabilityResponse>(
    API_ENDPOINTS.auth.checkLoginId(loginId),
    { cache: { noStore: true } }
  );
}

export function checkEmailAvailability(email: string) {
  return apiFetch<ApiAvailabilityResponse>(
    API_ENDPOINTS.auth.checkEmail(email),
    { cache: { noStore: true } }
  );
}
