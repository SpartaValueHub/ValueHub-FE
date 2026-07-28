import { apiFetch, getChatApiUrl } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type {
  ApiChatMessage,
  ApiChatMessageRequest,
  ApiChatRoom,
} from "@/types/chat/api";

/** HTTP only — path + API DTO. Do not call from UI/actions directly. */

/** GET /api/v1/chat/rooms — no-store (목록 캐시 없음) */
export function listChatRooms(accessToken?: string | null) {
  return apiFetch<ApiChatRoom[]>(API_ENDPOINTS.chat.rooms, {
    baseUrl: getChatApiUrl(),
    accessToken,
    cache: { noStore: true, revalidate: 0 },
  });
}

/** GET /api/v1/chat/rooms/{chatRoomUuid} */
export function getChatRoom(
  chatRoomUuid: string,
  accessToken?: string | null
) {
  return apiFetch<ApiChatRoom>(API_ENDPOINTS.chat.room(chatRoomUuid), {
    baseUrl: getChatApiUrl(),
    accessToken,
    cache: { noStore: true },
  });
}

/**
 * [BACKUP용] Next SSE 프록시에서 사용하던 업스트림 연결.
 * 현재 브라우저는 EventSource로 직접 구독하므로 기본 경로에서는 사용하지 않습니다.
 * @see lib/api/backups/chat-reactive-proxy.route.ts
 */
export function openChatReactiveStream(
  chatRoomUuid: string,
  accessToken?: string | null
) {
  const url = `${getChatApiUrl()}${API_ENDPOINTS.chat.reactive(chatRoomUuid)}`;
  const headers: Record<string, string> = {
    Accept: "text/event-stream",
  };
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  return fetch(url, {
    method: "GET",
    headers,
    cache: "no-store",
  });
}

/** GET /api/v1/chat/reactive/{chatRoomUuid}/latest */
export function getLatestChatMessages(
  chatRoomUuid: string,
  accessToken?: string | null
) {
  return apiFetch<ApiChatMessage[]>(
    API_ENDPOINTS.chat.reactiveLatest(chatRoomUuid),
    {
      baseUrl: getChatApiUrl(),
      accessToken,
      cache: { noStore: true },
    }
  );
}

/** POST /api/v1/chat/send */
export function sendChatMessage(
  body: ApiChatMessageRequest,
  accessToken?: string | null
) {
  return apiFetch<ApiChatMessage>(API_ENDPOINTS.chat.send, {
    method: "POST",
    body,
    baseUrl: getChatApiUrl(),
    accessToken,
    cache: { noStore: true },
  });
}
