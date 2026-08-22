import { apiFetch, getChatApiUrl } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type {
  ApiChatMessageListResponse,
  ApiChatRoomDetailResponse,
  ApiChatRoomListResponse,
  ApiChatUnreadCountResponse,
  ApiCreateChatRoomRequest,
  ApiCreateChatRoomResponse,
} from "@/types/chat/api";

function chatFetch<T>(
  path: string,
  options: { method?: string; body?: unknown } = {}
) {
  return apiFetch<T>(path, {
    method: options.method ?? "GET",
    body: options.body,
    baseUrl: getChatApiUrl(),
    cache: { noStore: true },
  });
}

export function createChatRoom(body: ApiCreateChatRoomRequest) {
  return chatFetch<ApiCreateChatRoomResponse>(API_ENDPOINTS.chat.rooms, {
    method: "POST",
    body,
  });
}

export function listChatRooms() {
  return chatFetch<ApiChatRoomListResponse>(API_ENDPOINTS.chat.rooms);
}

export function getChatUnreadCount() {
  return chatFetch<ApiChatUnreadCountResponse>(API_ENDPOINTS.chat.unreadCount);
}

export function getChatRoom(roomId: string) {
  return chatFetch<ApiChatRoomDetailResponse>(API_ENDPOINTS.chat.room(roomId));
}

export function listChatMessages(
  roomId: string,
  query?: { before?: string; limit?: number }
) {
  return chatFetch<ApiChatMessageListResponse>(
    API_ENDPOINTS.chat.messages(roomId, query)
  );
}
