import { formatListedAt } from "@/lib/format-listed-at";
import type { ApiChatListPatch } from "@/types/chat/api";
import type { UiChatRoom } from "@/types/chat/ui";

const PRODUCT_THUMBNAIL_FALLBACK = "/main/products/product-1.png";

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

function unreadFromPatch(
  patch: ApiChatListPatch,
  fallback: number,
  activeRoomId?: string
) {
  if (activeRoomId === patch.roomId) return 0;
  if (
    typeof patch.unreadCount === "number" &&
    Number.isFinite(patch.unreadCount)
  ) {
    return Math.max(0, patch.unreadCount);
  }
  return fallback;
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

/** 패치에 상품 스냅샷이 있으면 GET 없이 새 줄 insert 가능 */
export function canInsertChatListPatch(patch: ApiChatListPatch): boolean {
  const post = patch.productPost;
  return Boolean(
    post?.productPostName?.trim() ||
    post?.productPostUuid?.trim() ||
    post?.productPostImageUrl?.trim()
  );
}

export function needsChatRoomFetch(
  rooms: UiChatRoom[],
  patch: ApiChatListPatch
): boolean {
  const known = rooms.some((room) => room.id === patch.roomId);
  return !known && !canInsertChatListPatch(patch);
}

export function mergeRoomWithListPatch(
  room: UiChatRoom,
  patch: ApiChatListPatch,
  options: { activeRoomId?: string } = {}
): UiChatRoom {
  const { text, at } = lastMessageFromPatch(patch);
  return {
    ...room,
    lastMessage: text ?? room.lastMessage,
    unreadCount: unreadFromPatch(patch, room.unreadCount, options.activeRoomId),
    timeAgo: (at ? formatListedAt(at) : "") || room.timeAgo || "방금 전",
  };
}

function roomFromChatListPatch(
  patch: ApiChatListPatch,
  options: { activeRoomId?: string } = {}
): UiChatRoom | null {
  if (!canInsertChatListPatch(patch)) return null;
  const post = patch.productPost;
  const { text, at } = lastMessageFromPatch(patch);
  const counterpart = patch.counterpart;
  const nickname =
    counterpart && "nickname" in counterpart
      ? (counterpart.nickname?.trim() ?? "")
      : "";

  return {
    id: patch.roomId,
    title: post?.productPostName?.trim() ?? "",
    thumbnail: post?.productPostImageUrl?.trim() || PRODUCT_THUMBNAIL_FALLBACK,
    timeAgo: (at ? formatListedAt(at) : "") || "방금 전",
    unreadCount: unreadFromPatch(patch, 1, options.activeRoomId),
    peerName: nickname,
    peerMemberUuid: counterpart?.memberUuid?.trim() || undefined,
    productPostUuid: post?.productPostUuid?.trim() || undefined,
    price: post?.price ?? 0,
    location: "",
    lastMessage: text,
    reserved: post?.tradeStatus === "RESERVED",
  };
}

export function applyChatListPatch(
  rooms: UiChatRoom[],
  patch: ApiChatListPatch,
  options: { activeRoomId?: string } = {}
): UiChatRoom[] {
  const index = rooms.findIndex((room) => room.id === patch.roomId);
  if (index >= 0) {
    const current = rooms[index];
    if (!current) return rooms;
    const next = mergeRoomWithListPatch(current, patch, options);
    const rest = rooms.filter((_, i) => i !== index);
    return [next, ...rest];
  }

  const created = roomFromChatListPatch(patch, options);
  if (!created) return rooms;
  return [created, ...rooms];
}
