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
    mediaPresignedUrl: "/api/v1/members/me/media/presigned-url",
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
    mediaPresignedUrl: "/api/v1/product-posts/media/presigned-url",
    detail: (uuid: string) =>
      `/api/v1/product-posts/${encodeURIComponent(uuid)}`,
    update: (uuid: string) =>
      `/api/v1/product-posts/${encodeURIComponent(uuid)}`,
    delete: (uuid: string) =>
      `/api/v1/product-posts/${encodeURIComponent(uuid)}`,
    bump: (uuid: string) =>
      `/api/v1/product-posts/${encodeURIComponent(uuid)}/bump`,
    tradeStatus: (uuid: string) =>
      `/api/v1/product-posts/${encodeURIComponent(uuid)}/trade-status`,
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
  reservations: {
    create: "/api/v1/reservations",
    me: (status?: string) => {
      const base = "/api/v1/reservations/me";
      if (!status) return base;
      return `${base}?status=${encodeURIComponent(status)}`;
    },
    byChatRoom: (chatRoomId: string, productPostUuid?: string) => {
      const base = `/api/v1/reservations/by-chat-room/${encodeURIComponent(chatRoomId)}`;
      if (!productPostUuid) return base;
      return `${base}?productPostUuid=${encodeURIComponent(productPostUuid)}`;
    },
    detail: (reservationId: string) =>
      `/api/v1/reservations/${encodeURIComponent(reservationId)}`,
  },
  search: {
    popular: "/api/v1/search/popular",
    related: (q: string) => `/api/v1/search/related?q=${encodeURIComponent(q)}`,
    suggestions: (q: string) =>
      `/api/v1/search/suggestions?q=${encodeURIComponent(q)}`,
  },
  chat: {
    rooms: "/api/v1/chat/rooms",
    room: (roomId: string) =>
      `/api/v1/chat/rooms/${encodeURIComponent(roomId)}`,
    roomMessages: (
      roomId: string,
      params?: { before?: string; limit?: number }
    ) => {
      const base = `/api/v1/chat/rooms/${encodeURIComponent(roomId)}/messages`;
      if (!params) return base;
      const sp = new URLSearchParams();
      if (params.before) sp.set("before", params.before);
      if (params.limit != null) sp.set("limit", String(params.limit));
      const qs = sp.toString();
      return qs ? `${base}?${qs}` : base;
    },
    productRooms: (productPostUuid: string) =>
      `/api/v1/chat/product-posts/${encodeURIComponent(productPostUuid)}/rooms`,
    unreadCount: "/api/v1/chat/unread-count",
    imagePresignedUrl: (roomId: string) =>
      `/api/v1/chat/rooms/${encodeURIComponent(roomId)}/images/presigned-url`,
  },
  regions: {
    list: (keyword?: string) => {
      const base = "/api/v1/regions";
      if (!keyword?.trim()) return base;
      return `${base}?keyword=${encodeURIComponent(keyword.trim())}`;
    },
  },
  memberRegions: {
    list: "/api/v1/member-regions",
    create: "/api/v1/member-regions",
    change: (id: number | string) =>
      `/api/v1/member-regions/${encodeURIComponent(String(id))}`,
    setPrimary: (id: number | string) =>
      `/api/v1/member-regions/${encodeURIComponent(String(id))}/primary`,
    verify: (id: number | string) =>
      `/api/v1/member-regions/${encodeURIComponent(String(id))}/verify`,
    delete: (id: number | string) =>
      `/api/v1/member-regions/${encodeURIComponent(String(id))}`,
  },
} as const;
