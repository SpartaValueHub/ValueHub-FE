/**
 * API path 통합 관리 — base URL은 서비스별 get*ApiUrl() (Gateway prefix).
 * 경로 하드코딩은 lib/api/* 에서 금지.
 */
export const API_ENDPOINTS = {
  auth: {
    signUp: "/api/v1/auth/sign-up",
    resumeSignUp: "/api/v1/auth/sign-up/resume",
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
  },
  members: {
    create: "/api/v1/members",
    me: "/api/v1/members/me",
    checkNickname: (nickname: string) =>
      `/api/v1/members/check/nickname?nickname=${encodeURIComponent(nickname)}`,
  },
  categories: {
    children: (parentUuid?: string) => {
      if (!parentUuid) return "/api/v1/categories";
      return `/api/v1/categories?parentUuid=${encodeURIComponent(parentUuid)}`;
    },
    leaves: (parentUuid?: string) => {
      if (!parentUuid) return "/api/v1/categories/leaves";
      return `/api/v1/categories/leaves?parentUuid=${encodeURIComponent(parentUuid)}`;
    },
  },
} as const;
