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
    /** 내 계정 정보 (logInId·email·phone·joinedAt) */
    me: "/api/v1/auth/me",
    /** 타인 프로필용 가입일 (Gateway public) */
    memberJoinedAt: (memberUuid: string) =>
      `/api/v1/auth/members/${encodeURIComponent(memberUuid)}/joined-at`,
    /** PASS 본인인증(WITHDRAWAL) 후 회원 탈퇴 */
    withdraw: "/api/v1/auth/withdraw",
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
    publicProfile: (memberUuid: string) =>
      `/api/v1/members/${encodeURIComponent(memberUuid)}/profile`,
    checkNickname: (nickname: string) =>
      `/api/v1/members/check/nickname?nickname=${encodeURIComponent(nickname)}`,
  },
  terms: {
    active: "/api/v1/terms/active",
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
  productPosts: {
    create: "/api/v1/product-posts",
    detail: (uuid: string) => `/api/v1/product-posts/${encodeURIComponent(uuid)}`,
    delete: (uuid: string) => `/api/v1/product-posts/${encodeURIComponent(uuid)}`,
    list: (params?: Record<string, string | string[]>) => {
      const base = "/api/v1/product-posts";
      if (!params) return base;
      const sp = new URLSearchParams();
      for (const [k, v] of Object.entries(params)) {
        if (Array.isArray(v)) v.forEach((item) => sp.append(k, item));
        else sp.append(k, v);
      }
      const qs = sp.toString();
      return qs ? `${base}?${qs}` : base;
    },
  },
} as const;
