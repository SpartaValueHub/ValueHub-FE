import {
  CHAT_MAP_PREVIEW,
  formatChatDateDivider,
  formatChatDateKey,
  formatChatMessageTime,
} from "@/constants/chat-page";
import { formatListedAt } from "@/lib/format-listed-at";
import type {
  ApiChatListPreview,
  ApiChatMessage,
  ApiChatRoomDetailResponse,
  ApiChatRoomListItem,
} from "@/types/chat/api";
import type { UiChatMessage, UiChatRoom } from "@/types/chat/ui";

function emptyRoom(id: string): UiChatRoom {
  return {
    id,
    title: "",
    thumbnail: "",
    timeAgo: "",
    unreadCount: 0,
    peerName: "",
    price: 0,
    location: "",
  };
}

export function mapChatRoomListItem(api: ApiChatRoomListItem): UiChatRoom {
  const product = api.productPost;
  const stamp = api.lastMessage?.createdAt ?? api.updatedAt;
  return {
    id: api.roomId,
    title: product?.productPostName ?? "",
    thumbnail: product?.productPostImageUrl ?? "",
    timeAgo: stamp ? formatListedAt(stamp) : "",
    unreadCount: api.unreadCount ?? 0,
    peerName: "",
    price: product?.price ?? 0,
    location: "",
    lastMessage: api.lastMessage?.content,
    reserved: product?.tradeStatus === "RESERVED",
    productPostUuid: product?.productPostUuid ?? undefined,
  };
}

export function mapChatRoomDetail(
  api: ApiChatRoomDetailResponse,
  base?: UiChatRoom
): UiChatRoom {
  const product = api.productPost;
  const room = base ?? emptyRoom(api.roomId);
  return {
    ...room,
    id: api.roomId,
    title: product?.productPostName ?? room.title,
    thumbnail: product?.productPostImageUrl ?? room.thumbnail,
    price: product?.price ?? room.price,
    reserved: product?.tradeStatus === "RESERVED" || room.reserved,
    peerName: api.counterpart?.nickname ?? room.peerName,
    peerImageUrl: api.counterpart?.profileImageUrl ?? room.peerImageUrl,
    productPostUuid: product?.productPostUuid ?? room.productPostUuid,
    location: room.location,
  };
}

export function applyChatListPreview(
  room: UiChatRoom,
  preview: ApiChatListPreview
): UiChatRoom {
  const stamp = preview.lastMessage?.createdAt ?? preview.updatedAt;
  return {
    ...room,
    lastMessage: preview.lastMessage?.content ?? room.lastMessage,
    unreadCount: preview.unreadCount,
    timeAgo: stamp ? formatListedAt(stamp) : room.timeAgo,
  };
}

export function mapChatMessage(
  api: ApiChatMessage,
  viewerMemberUuid: string
): UiChatMessage {
  const from: UiChatMessage["from"] =
    api.senderUuid === viewerMemberUuid ? "me" : "peer";
  const createdAt = api.createdAt;
  const time = createdAt ? formatChatMessageTime(createdAt) : undefined;
  const dateKey = createdAt ? formatChatDateKey(createdAt) : undefined;
  const type = api.messageType;

  if (type === "IMAGE") {
    return {
      id: api.messageId,
      kind: "image",
      from,
      imageSrc: api.content ?? undefined,
      time,
      createdAt,
      dateKey,
    };
  }

  if (type === "LOCATION") {
    return {
      id: api.messageId,
      kind: "location",
      from,
      placeName: api.metadata?.placeName ?? "위치",
      mapImage: CHAT_MAP_PREVIEW,
      time,
      createdAt,
      dateKey,
    };
  }

  if (type === "RESERVATION") {
    const meetAt = api.metadata?.meetAt;
    const placeName = api.metadata?.placeName ?? "";
    return {
      id: api.messageId,
      kind: "system-reservation",
      from,
      time,
      createdAt,
      dateKey,
      reservationSummary: {
        dateLine: meetAt ? formatChatDateDivider(meetAt) : (api.content ?? ""),
        timePlaceLine: placeName,
      },
    };
  }

  return {
    id: api.messageId,
    kind: "text",
    from,
    text: api.content ?? "",
    time,
    createdAt,
    dateKey,
  };
}
