/**
 * chat-service 오케스트레이션.
 * 방 생성 스냅샷은 Chat이 product-post를 조회하지 않으므로
 * product-post-service + member-service에서 서버가 조립한다.
 */
import {
  createChatRoom,
  getChatRoom,
  listChatMessages,
  listChatRooms,
  listChatRoomsByProductPost,
} from "@/lib/api/chat";
import { formatListedAt } from "@/lib/format-listed-at";
import { getMemberPublicProfileService } from "@/services/member.service";
import { getProductPostDetailService } from "@/services/product-posts.service";
import type {
  ApiChatMessage,
  ApiChatRoomDetail,
  ApiChatRoomListItem,
  ApiChatTradeStatus,
  ApiCreateChatRoomResponse,
} from "@/types/chat/api";
import type {
  UiChatMessage,
  UiChatRoom,
  UiCreatedChatRoom,
} from "@/types/chat/ui";

const SELLER_NICKNAME_FALLBACK = "판매자";
const PRODUCT_THUMBNAIL_FALLBACK = "/main/products/product-1.png";

function mapCreatedChatRoom(api: ApiCreateChatRoomResponse): UiCreatedChatRoom {
  return {
    roomId: api.roomId,
    productPostUuid: api.productPostUuid,
    buyerUuid: api.buyerUuid,
    sellerUuid: api.sellerUuid,
    reused: api.reused,
  };
}

function toTradeStatus(value: string): ApiChatTradeStatus {
  if (value === "RESERVED" || value === "SOLD_OUT") return value;
  return "SELLING";
}

function formatChatTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("ko-KR", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function mapChatRoomDetail(api: ApiChatRoomDetail): UiChatRoom {
  const post = api.productPost;
  return {
    id: api.roomId,
    title: post?.productPostName?.trim() ?? "",
    thumbnail: post?.productPostImageUrl?.trim() || PRODUCT_THUMBNAIL_FALLBACK,
    timeAgo: "",
    unreadCount: 0,
    peerName: api.counterpart?.nickname?.trim() ?? "",
    peerImageUrl: api.counterpart?.profileImageUrl?.trim() || null,
    productPostUuid: post?.productPostUuid?.trim() || undefined,
    price: post?.price ?? 0,
    location: "",
    reserved: post?.tradeStatus === "RESERVED",
  };
}

export function mapChatRoomListItem(api: ApiChatRoomListItem): UiChatRoom {
  const post = api.productPost;
  const stamp = api.lastMessage?.createdAt ?? api.updatedAt;
  const lastMessage = api.lastMessage?.content?.trim() ?? "";

  return {
    id: api.roomId,
    title: post?.productPostName?.trim() ?? "",
    thumbnail: post?.productPostImageUrl?.trim() || PRODUCT_THUMBNAIL_FALLBACK,
    timeAgo: stamp ? formatListedAt(stamp) : "",
    unreadCount: api.unreadCount ?? 0,
    peerName: "",
    productPostUuid: post?.productPostUuid?.trim() || undefined,
    price: post?.price ?? 0,
    location: "",
    lastMessage: lastMessage || undefined,
    reserved: post?.tradeStatus === "RESERVED",
  };
}

export function mapChatMessage(
  api: ApiChatMessage,
  viewerMemberUuid: string
): UiChatMessage {
  const from = api.senderUuid === viewerMemberUuid ? "me" : "peer";
  const time = formatChatTime(api.createdAt);

  if (api.messageType === "IMAGE") {
    return {
      id: api.messageId,
      kind: "image",
      from,
      imageSrc: api.content,
      time,
    };
  }
  if (api.messageType === "LOCATION") {
    return {
      id: api.messageId,
      kind: "location",
      from,
      placeName: api.metadata?.placeName || api.content,
      time,
    };
  }
  if (api.messageType === "RESERVATION") {
    const meetAt = api.metadata?.meetAt
      ? formatChatTime(api.metadata.meetAt)
      : "";
    return {
      id: api.messageId,
      kind: "system-reservation",
      from,
      time,
      reservationSummary: {
        dateLine: api.content,
        timePlaceLine: [meetAt, api.metadata?.placeName]
          .filter(Boolean)
          .join(" "),
      },
    };
  }

  return { id: api.messageId, kind: "text", from, text: api.content, time };
}

export async function createChatRoomService(input: {
  productPostUuid: string;
  sellerUuid: string;
  sellerNickname?: string | null;
}): Promise<UiCreatedChatRoom> {
  const post = await getProductPostDetailService(input.productPostUuid);
  const sellerUuid = input.sellerUuid.trim();

  if (post.memberUuid !== sellerUuid) {
    throw new Error("판매자 정보가 상품과 일치하지 않습니다.");
  }

  const imageUrl = post.images[0]?.url.trim() ?? "";
  if (!imageUrl) {
    throw new Error("상품 이미지가 없어 채팅을 시작할 수 없습니다.");
  }

  let sellerNickname = input.sellerNickname?.trim() || "";
  if (!sellerNickname) {
    try {
      const profile = await getMemberPublicProfileService(sellerUuid);
      sellerNickname = profile.nickname.trim();
    } catch {
      /* 스냅샷 필수값 — 상세 표시와 같은 fallback */
    }
  }
  if (!sellerNickname) {
    sellerNickname = SELLER_NICKNAME_FALLBACK;
  }

  const api = await createChatRoom({
    productPostUuid: post.productPostUuid,
    sellerUuid,
    productPostImageUrl: imageUrl,
    productPostName: post.name,
    price: post.price,
    tradeStatus: toTradeStatus(post.tradeStatus),
    sellerNickname,
  });

  return mapCreatedChatRoom(api);
}

export async function listChatRoomsService(): Promise<UiChatRoom[]> {
  const api = await listChatRooms();
  return (api.rooms ?? []).map(mapChatRoomListItem);
}

export async function listChatRoomsByProductPostService(
  productPostUuid: string
): Promise<UiChatRoom[]> {
  const api = await listChatRoomsByProductPost(productPostUuid);
  return (api.rooms ?? []).map(mapChatRoomListItem);
}

export async function getChatRoomService(roomId: string): Promise<UiChatRoom> {
  const api = await getChatRoom(roomId);
  return mapChatRoomDetail(api);
}

export async function listChatMessagesService(
  roomId: string,
  viewerMemberUuid: string
): Promise<UiChatMessage[]> {
  const api = await listChatMessages(roomId);
  return (api.messages ?? []).map((item) =>
    mapChatMessage(item, viewerMemberUuid)
  );
}
