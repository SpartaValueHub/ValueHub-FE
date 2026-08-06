import { apiFetch, getApiUrl } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type {
  ApiAvailabilityResponse,
  ApiSignupRequest,
  ApiSignupResponse,
} from "@/types/auth/api";

/** auth-service HTTP — lib/api/* 전용. UI·actions에서 import 금지. */

function getTrustedOriginHeader(): Record<string, string> {
  const origin = process.env.AUTH_TRUSTED_ORIGIN?.trim();
  return origin ? { Origin: origin } : {};
}

export function pingAuthSession(cookieHeader: string) {
  const baseUrl = getApiUrl();
  return fetch(`${baseUrl}${API_ENDPOINTS.auth.session}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Cookie: cookieHeader,
    },
    cache: "no-store",
  });
}

export function probeAuthRefresh(cookieHeader: string) {
  const baseUrl = getApiUrl();
  return fetch(`${baseUrl}${API_ENDPOINTS.auth.refresh}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Cookie: cookieHeader,
      ...getTrustedOriginHeader(),
    },
    cache: "no-store",
  });
}

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
    /** 세션 종료·blacklist 상태에서 refresh 재시도로 duplicate flow가 꼬이지 않도록 */
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
