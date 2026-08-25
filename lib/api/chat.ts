import { apiFetch, getChatApiUrl } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type {
  ApiChatImagePresignedRequest,
  ApiChatImagePresignedResponse,
  ApiChatMessageList,
  ApiChatRoomDetail,
  ApiChatRoomList,
  ApiChatUnreadCount,
  ApiCreateChatRoomRequest,
  ApiCreateChatRoomResponse,
} from "@/types/chat/api";

/** chat-service HTTP — lib/api/* 전용. UI·actions에서 import 금지. */

function chatFetch<T>(
  path: string,
  options: { method?: string; body?: unknown } = {}
) {
  return apiFetch<T>(path, {
    method: options.method ?? "GET",
    body: options.body,
    baseUrl: getChatApiUrl(),
    cache: { noStore: true },
    timeoutMillis: 12_000,
  });
}

export function createChatRoom(body: ApiCreateChatRoomRequest) {
  return chatFetch<ApiCreateChatRoomResponse>(API_ENDPOINTS.chat.rooms, {
    method: "POST",
    body,
  });
}

export function listChatRooms() {
  return chatFetch<ApiChatRoomList>(API_ENDPOINTS.chat.rooms);
}

export function listChatRoomsByProductPost(productPostUuid: string) {
  return chatFetch<ApiChatRoomList>(
    API_ENDPOINTS.chat.productRooms(productPostUuid)
  );
}

export function getChatRoom(roomId: string) {
  return chatFetch<ApiChatRoomDetail>(API_ENDPOINTS.chat.room(roomId));
}

export function listChatMessages(
  roomId: string,
  query?: { before?: string; limit?: number }
) {
  return chatFetch<ApiChatMessageList>(
    API_ENDPOINTS.chat.roomMessages(roomId, query)
  );
}

export function getChatUnreadCount() {
  return chatFetch<ApiChatUnreadCount>(API_ENDPOINTS.chat.unreadCount);
}

export function createChatImagePresignedUrl(
  roomId: string,
  body: ApiChatImagePresignedRequest
) {
  return chatFetch<ApiChatImagePresignedResponse>(
    API_ENDPOINTS.chat.imagePresignedUrl(roomId),
    { method: "POST", body }
  );
}
