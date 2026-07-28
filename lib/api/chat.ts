import { apiFetch } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type {
  ApiChatMessage,
  ApiChatMessageRequest,
} from "@/types/chat/api";

/** HTTP only — path + API DTO. Do not call from UI/actions directly. */

export function listChatMessages(chatRoomUuid: string) {
  return apiFetch<ApiChatMessage[]>(
    API_ENDPOINTS.chat.messages(chatRoomUuid),
    {
      cache: { noStore: true },
    }
  );
}

export function sendChatMessage(body: ApiChatMessageRequest) {
  return apiFetch<ApiChatMessage>(API_ENDPOINTS.chat.send, {
    method: "POST",
    body,
    cache: { noStore: true },
  });
}
