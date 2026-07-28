import type { ApiChatMessage } from "@/types/chat/api";
import type { UiChatMessage } from "@/types/chat/ui";

export function isApiChatMessage(value: unknown): value is ApiChatMessage {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<ApiChatMessage>;
  return typeof item.chatMessageUuid === "string" && item.chatMessageUuid.length > 0;
}

export function mapChatMessage(
  message: ApiChatMessage,
  currentUserUuid?: string
): UiChatMessage {
  const senderUuid = (message.senderUuid ?? "").trim();
  const me = (currentUserUuid ?? "").trim();

  return {
    chatMessageUuid: message.chatMessageUuid,
    chatRoomUuid: message.chatRoomUuid ?? "",
    messageType: message.messageType ?? "TEXT",
    message: message.message ?? "",
    senderUuid,
    createdAt: message.createdAt ?? "",
    updatedAt: message.updatedAt ?? "",
    /** 로그인 유저 uuid === senderUuid → 내가 작성한 글 */
    isMine: Boolean(me && senderUuid && me === senderUuid),
  };
}

export function normalizeChatMessages(value: unknown): ApiChatMessage[] {
  if (value == null) return [];

  const list = Array.isArray(value) ? value : [value];
  return list.filter(isApiChatMessage);
}

export function parseChatMessageEventData(data: string): ApiChatMessage[] {
  if (!data || data === "null" || data === "undefined") return [];

  try {
    return normalizeChatMessages(JSON.parse(data));
  } catch {
    return [];
  }
}
