/**
 * API path 통합 관리.
 * base URL은 client.ts의 getApiUrl() / POSTS_API_URL 을 사용하고,
 * 여기서는 path만 정의합니다.
 */
export const API_ENDPOINTS = {
  auth: {
    signUp: "/api/v1/auth/sign-up",
    signIn: "/api/v1/auth/sign-in",
  },
  posts: {
    list: "/posts",
    detail: (id: number | string) => `/posts/${id}`,
  },
  chat: {
    messages: (chatRoomUuid: string) =>
      `/api/v1/chat/rooms/${chatRoomUuid}/messages`,
    send: "/api/v1/chat/messages",
  },
} as const;
