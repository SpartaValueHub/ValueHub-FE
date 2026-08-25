import { formatListedAt } from "@/lib/format-listed-at";
import type { ApiChatListPatch } from "@/types/chat/api";
import type { UiChatRoom } from "@/types/chat/ui";

function lastMessageFromPatch(patch: ApiChatListPatch): {
  text?: string;
  at?: string;
} {
  const raw = patch.lastMessage;
  if (typeof raw === "string") {
    const text = raw.trim();
    return { text: text || undefined, at: patch.createdAt ?? patch.updatedAt };
  }
  if (raw && typeof raw === "object") {
    const text = raw.content?.trim() ?? "";
    return {
      text: text || undefined,
      at: raw.createdAt || patch.createdAt || patch.updatedAt,
    };
  }
  const text = patch.content?.trim() ?? "";
  return {
    text: text || undefined,
    at: patch.createdAt ?? patch.updatedAt,
  };
}

export function parseChatListPatch(raw: string): ApiChatListPatch | null {
  try {
    const body = JSON.parse(raw) as ApiChatListPatch & {
      chatRoomId?: string;
    };
    const roomId =
      typeof body?.roomId === "string"
        ? body.roomId
        : typeof body?.chatRoomId === "string"
          ? body.chatRoomId
          : "";
    if (!roomId) return null;
    return { ...body, roomId };
  } catch {
    return null;
  }
}

export function applyChatListPatch(
  rooms: UiChatRoom[],
  patch: ApiChatListPatch,
  options: { activeRoomId?: string } = {}
): UiChatRoom[] {
  const index = rooms.findIndex((room) => room.id === patch.roomId);
  if (index < 0) return rooms;

  const current = rooms[index];
  const { text, at } = lastMessageFromPatch(patch);
  const viewing = options.activeRoomId === patch.roomId;
  const unreadCount = viewing
    ? 0
    : typeof patch.unreadCount === "number" &&
        Number.isFinite(patch.unreadCount)
      ? Math.max(0, patch.unreadCount)
      : current.unreadCount;

  const next: UiChatRoom = {
    ...current,
    lastMessage: text ?? current.lastMessage,
    unreadCount,
    timeAgo: (at ? formatListedAt(at) : "") || current.timeAgo,
  };

  const rest = rooms.filter((_, i) => i !== index);
  return [next, ...rest];
}
