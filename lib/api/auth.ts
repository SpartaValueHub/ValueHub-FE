import { apiFetch, apiTimeoutFromEnv } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type {
  ApiAuthAccountResponse,
  ApiAvailabilityResponse,
  ApiSignupRequest,
  ApiSignupResponse,
  ApiSignupResumeRequest,
  ApiSignupResumeResponse,
} from "@/types/auth/api";

/** auth-service HTTP — lib/api/* 전용. UI·actions에서 import 금지. */

/** 내 계정 정보 — Gateway JWT → X-Member-Uuid */
export function getMyAuthAccount() {
  return apiFetch<ApiAuthAccountResponse>(API_ENDPOINTS.auth.me, {
    method: "GET",
    cache: { noStore: true },
    timeoutMillis: 5_000,
  });
}

export function registerUser(body: ApiSignupRequest) {
  return apiFetch<ApiSignupResponse>(API_ENDPOINTS.auth.signUp, {
    method: "POST",
    body,
    cache: { noStore: true },
    skipSessionRecovery: true,
    timeoutMillis: apiTimeoutFromEnv("AUTH_SIGNUP_TIMEOUT_MILLIS", 10_000),
  });
}

export function resumeSignup(body: ApiSignupResumeRequest) {
  return apiFetch<ApiSignupResumeResponse>(API_ENDPOINTS.auth.resumeSignUp, {
    method: "POST",
    body,
    cache: { noStore: true },
    skipSessionRecovery: true,
    timeoutMillis: 5_000,
  });
}

export function logoutUser() {
  return apiFetch<void>(API_ENDPOINTS.auth.logout, {
    method: "POST",
    cache: { noStore: true },
    trustedOrigin: true,
    skipSessionRecovery: true,
    timeoutMillis: 5_000,
  });
}

/** PASS WITHDRAWAL confirm 후 탈퇴 — 204 + 쿠키 만료 */
export function withdrawMember(body: { requestToken: string }) {
  return apiFetch<void>(API_ENDPOINTS.auth.withdraw, {
    method: "POST",
    body,
    cache: { noStore: true },
    trustedOrigin: true,
    timeoutMillis: 10_000,
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
