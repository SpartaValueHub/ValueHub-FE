import { notFound } from "next/navigation";

import { ChatRoomTemplate } from "@/components/templates/chat/ChatRoomTemplate";
import { ApiError } from "@/lib/api/client";
import { requireAuth } from "@/lib/session";
import {
  getChatRoomService,
  listChatMessagesService,
  listChatRoomsService,
} from "@/services/chat.service";
import { getCurrentReservationByChatRoomService } from "@/services/reservations.service";
import type { UiChatMessagePage, UiChatRoom } from "@/types/chat/ui";
import type { UiReservation } from "@/types/reservations/ui";

interface ChatRoomPageProps {
  params: Promise<{ uuid: string }>;
}

/**
 * `/chat/[uuid]` — 상세 GET + 현재 예약 + 메시지.
 * 예약 204는 빈 패널. 예약 없음을 채팅방 404로 처리하지 않는다.
 */
export default async function ChatRoomPage({ params }: ChatRoomPageProps) {
  const { uuid } = await params;
  const user = await requireAuth(`/chat/${uuid}`);

  let room: UiChatRoom;
  try {
    room = await getChatRoomService(uuid);
  } catch {
    notFound();
  }

  const productPostUuid = room.productPostUuid?.trim() || undefined;
  const canManageReservation =
    Boolean(room.sellerMemberUuid) && room.sellerMemberUuid === user.memberUuid;

  const [rooms, messagePage, reservationResult] = await Promise.all([
    listChatRoomsService().catch((): UiChatRoom[] => []),
    listChatMessagesService(uuid, user.memberUuid).catch(
      (): UiChatMessagePage => ({ messages: [], hasMore: false })
    ),
    getCurrentReservationByChatRoomService(uuid, productPostUuid)
      .then(
        (
          reservation
        ): { reservation: UiReservation | null; error: string | null } => ({
          reservation,
          error: null,
        })
      )
      .catch(
        (
          error: unknown
        ): { reservation: UiReservation | null; error: string | null } => {
          const message =
            error instanceof ApiError
              ? error.message
              : error instanceof Error
                ? error.message
                : "현재 예약을 불러오지 못했습니다.";
          return { reservation: null, error: message };
        }
      ),
  ]);

  const list = rooms.map((item) =>
    item.id === room.id
      ? {
          ...item,
          peerName: room.peerName,
          peerImageUrl: room.peerImageUrl,
          peerMemberUuid: room.peerMemberUuid ?? item.peerMemberUuid,
          productPostUuid: room.productPostUuid ?? item.productPostUuid,
          sellerMemberUuid: room.sellerMemberUuid ?? item.sellerMemberUuid,
        }
      : item
  );
  const roomsForUi = list.some((item) => item.id === room.id)
    ? list
    : [room, ...list];

  return (
    <ChatRoomTemplate
      rooms={roomsForUi}
      roomId={room.id}
      messages={messagePage.messages}
      hasMoreMessages={messagePage.hasMore}
      reservation={reservationResult.reservation}
      canManageReservation={canManageReservation}
      reservationLoadError={reservationResult.error}
    />
  );
}
