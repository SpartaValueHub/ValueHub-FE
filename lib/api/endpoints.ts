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
    /** SSE — 채팅방 전체/실시간 스트림 */
    reactive: (chatRoomUuid: string) =>
      `/api/v1/chat/reactive/${chatRoomUuid}`,
    /** GET — 최신 채팅 항목 */
    reactiveLatest: (chatRoomUuid: string) =>
      `/api/v1/chat/reactive/${chatRoomUuid}/latest`,
    /** POST — 메시지 전송 */
    send: "/api/v1/chat/send",
    /** GET — 채팅방 목록 */
    rooms: "/api/v1/chat/rooms",
    /** GET — 채팅방 단건 */
    room: (chatRoomUuid: string) => `/api/v1/chat/rooms/${chatRoomUuid}`,
  },
  /** Next BFF (브라우저/내부용) */
  bff: {
    chatRooms: "/api/chat/rooms",
    /**
     * [BACKUP] 이전 Next SSE proxy 경로
     * @see lib/api/backups/chat-reactive-proxy.route.ts
     */
    // chatReactive: (chatRoomUuid: string) =>
    //   `/api/chat/reactive/${chatRoomUuid}`,
  },
} as const;
