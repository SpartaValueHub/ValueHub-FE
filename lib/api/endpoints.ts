/**
 * API path 통합 관리 — base URL은 getApiUrl() (Gateway auth-service prefix).
 * 경로 하드코딩은 lib/api/* 에서 금지.
 */
export const API_ENDPOINTS = {
  auth: {
    signUp: "/api/v1/auth/sign-up",
    signIn: "/api/v1/auth/sign-in",
    refresh: "/api/v1/auth/refresh",
    logout: "/api/v1/auth/logout",
    checkLoginId: (loginId: string) =>
      `/api/v1/auth/check/login-id?loginId=${encodeURIComponent(loginId)}`,
    checkEmail: (email: string) =>
      `/api/v1/auth/check/email?email=${encodeURIComponent(email)}`,
  },
  identityVerification: {
    confirm: "/api/v1/identity-verifications/confirm",
    status: (requestToken: string) =>
      `/api/v1/identity-verifications/${encodeURIComponent(requestToken)}`,
  },
} as const;
