/**
 * chat-service 오케스트레이션.
 * 방 생성 스냅샷은 Chat이 product-post를 조회하지 않으므로
 * product-post-service + member-service에서 서버가 조립한다.
 */
import {
  createChatRoom,
  createChatImagePresignedUrl,
  getChatRoom,
  getChatUnreadCount,
  listChatMessages,
  listChatRooms,
  listChatRoomsByProductPost,
} from "@/lib/api/chat";
import { mapChatImagePresigned } from "@/lib/chat/map-image-presign";
import { mapChatMessage } from "@/lib/chat/map-message";
import { formatListedAt } from "@/lib/format-listed-at";
import { getMemberPublicProfileService } from "@/services/member.service";
import { getProductPostDetailService } from "@/services/product-posts.service";
import type {
  ApiChatProductPostStatus,
  ApiChatRoomDetail,
  ApiChatRoomListItem,
  ApiChatTradeStatus,
  ApiCreateChatRoomResponse,
} from "@/types/chat/api";
import type { ProductPostStatus } from "@/types/product-posts/ui";
import {
  CHAT_MESSAGE_PAGE_SIZE,
  type UiChatImagePresigned,
  type UiChatMessagePage,
  type UiChatRoom,
  type UiCreatedChatRoom,
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

function toProductPostStatus(
  value: ProductPostStatus | string
): ApiChatProductPostStatus {
  if (value === "HIDDEN" || value === "DELETED") return value;
  return "PUBLIC";
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
    peerMemberUuid: api.counterpart?.memberUuid?.trim() || undefined,
    productPostUuid: post?.productPostUuid?.trim() || undefined,
    sellerMemberUuid: api.seller?.memberUuid?.trim() || undefined,
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
    peerMemberUuid: api.counterpart?.memberUuid?.trim() || undefined,
    productPostUuid: post?.productPostUuid?.trim() || undefined,
    price: post?.price ?? 0,
    location: "",
    lastMessage: lastMessage || undefined,
    reserved: post?.tradeStatus === "RESERVED",
  };
}

export { mapChatMessage };

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
    productPostStatus: toProductPostStatus(post.productPostStatus),
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
  const room = mapChatRoomDetail(api);
  const memberUuid = room.peerMemberUuid?.trim();
  if (!memberUuid) return room;

  try {
    const profile = await getMemberPublicProfileService(memberUuid);
    const imageUrl = profile.profileImageUrl?.trim() || null;
    return {
      ...room,
      peerName: room.peerName || profile.nickname,
      peerImageUrl: imageUrl ?? room.peerImageUrl,
    };
  } catch {
    return room;
  }
}

export async function getChatUnreadCountService(): Promise<number> {
  const api = await getChatUnreadCount();
  const count = api.totalUnreadCount ?? 0;
  return count > 0 ? count : 0;
}

export async function listChatMessagesService(
  roomId: string,
  viewerMemberUuid: string,
  query?: { before?: string; limit?: number }
): Promise<UiChatMessagePage> {
  const limit = query?.limit ?? CHAT_MESSAGE_PAGE_SIZE;
  const api = await listChatMessages(
    roomId,
    query?.before || query?.limit != null
      ? { before: query?.before, limit }
      : undefined
  );
  const messages = (api.messages ?? []).map((item) =>
    mapChatMessage(item, viewerMemberUuid)
  );
  return {
    messages,
    hasMore: messages.length >= limit && messages.length > 0,
  };
}

export async function createChatImagePresignedUrlService(
  roomId: string,
  body: { contentType: string; fileSize: number }
): Promise<UiChatImagePresigned> {
  const api = await createChatImagePresignedUrl(roomId, body);
  return mapChatImagePresigned(api);
}
