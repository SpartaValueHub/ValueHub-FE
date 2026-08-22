/**
 * chat-service 오케스트레이션. Api* → Ui* 매핑.
 */
import {
  createChatRoom,
  getChatRoom,
  getChatUnreadCount,
  listChatMessages,
  listChatRooms,
} from "@/lib/api/chat";
import {
  mapChatMessage,
  mapChatRoomDetail,
  mapChatRoomListItem,
} from "@/lib/chat/map-ui";
import { getAuthUser } from "@/lib/session";
import { getProductPostDetailService } from "@/services/product-posts.service";
import type { ApiCreateChatRoomRequest } from "@/types/chat/api";
import type { UiChatMessage, UiChatRoom } from "@/types/chat/ui";

export async function listChatRoomsService(): Promise<UiChatRoom[]> {
  const response = await listChatRooms();
  return (response.rooms ?? []).map(mapChatRoomListItem);
}

export async function getChatUnreadCountService(): Promise<number> {
  const response = await getChatUnreadCount();
  return response.totalUnreadCount ?? 0;
}

export async function getChatRoomService(roomId: string): Promise<UiChatRoom> {
  const rooms = await listChatRoomsService().catch(() => [] as UiChatRoom[]);
  const detail = await getChatRoom(roomId);
  const listed = rooms.find((room) => room.id === detail.roomId);
  return mapChatRoomDetail(detail, listed);
}

export async function listChatMessagesService(
  roomId: string,
  query?: { before?: string; limit?: number }
): Promise<UiChatMessage[]> {
  const user = await getAuthUser();
  const viewerUuid = user?.memberUuid ?? "";
  const response = await listChatMessages(roomId, query);
  return (response.messages ?? []).map((message) =>
    mapChatMessage(message, viewerUuid)
  );
}

export async function listChatRoomWorkspaceService(roomId: string): Promise<{
  rooms: UiChatRoom[];
  room: UiChatRoom;
  messages: UiChatMessage[];
}> {
  const [rooms, detail, messages] = await Promise.all([
    listChatRoomsService(),
    getChatRoom(roomId),
    listChatMessagesService(roomId),
  ]);
  const room = mapChatRoomDetail(
    detail,
    rooms.find((item) => item.id === detail.roomId)
  );
  const merged = rooms.some((item) => item.id === room.id)
    ? rooms.map((item) => (item.id === room.id ? room : item))
    : [room, ...rooms];
  return { rooms: merged, room, messages };
}

export async function createChatRoomService(input: {
  productPostUuid: string;
  sellerUuid: string;
  sellerNickname: string;
}): Promise<{ roomId: string; reused: boolean }> {
  const nickname = input.sellerNickname.trim();
  if (!nickname) {
    throw new Error(
      "판매자 닉네임을 확인할 수 없습니다. 잠시 후 다시 시도해 주세요."
    );
  }

  const post = await getProductPostDetailService(input.productPostUuid);
  const imageUrl = post.images[0]?.url?.trim() ?? "";
  if (!imageUrl) {
    throw new Error("상품 이미지가 없어 채팅방을 만들 수 없습니다.");
  }

  const body: ApiCreateChatRoomRequest = {
    productPostUuid: input.productPostUuid,
    sellerUuid: input.sellerUuid,
    productPostImageUrl: imageUrl,
    productPostName: post.name,
    price: post.price,
    tradeStatus: post.tradeStatus,
    sellerNickname: nickname,
  };
  const created = await createChatRoom(body);
  return { roomId: created.roomId, reused: created.reused };
}
