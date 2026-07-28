import type { UiChatRoom } from "@/types/chat/ui";

/** 마지막 메시지 시각 기준 최신 채팅방 먼저 */
export function sortRoomsByLatest(rooms: UiChatRoom[]): UiChatRoom[] {
  return [...rooms].sort((a, b) => {
    const aAt = a.lastMessageAt ?? "";
    const bAt = b.lastMessageAt ?? "";
    if (!aAt && !bAt) return 0;
    if (!aAt) return 1;
    if (!bAt) return -1;
    return bAt.localeCompare(aAt);
  });
}

export function applyRoomPreview(
  rooms: UiChatRoom[],
  update: {
    chatRoomUuid: string;
    lastMessage: string;
    lastMessageAt: string;
  }
): UiChatRoom[] {
  const next = rooms.map((room) => {
    if (room.chatRoomUuid !== update.chatRoomUuid) return room;

    const prevAt = room.lastMessageAt ?? "";
    if (prevAt && update.lastMessageAt && update.lastMessageAt < prevAt) {
      return room;
    }

    return {
      ...room,
      lastMessage: update.lastMessage,
      lastMessageAt: update.lastMessageAt || room.lastMessageAt,
    };
  });

  return sortRoomsByLatest(next);
}
