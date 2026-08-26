import { ChatListTemplate } from "@/components/templates/chat/ChatListTemplate";
import { reservationCardFromListItem } from "@/constants/chat-page";
import { requireAuth } from "@/lib/session";
import { resolveProductChatEntryService } from "@/services/chat-entry.service";
import {
  listChatRoomsByProductPostService,
  listChatRoomsService,
} from "@/services/chat.service";
import { listMyReservationsService } from "@/services/reservations.service";
import type {
  UiChatReservationCard,
  UiChatRoom,
  UiProductChatEntry,
} from "@/types/chat/ui";
import type { UiReservationListItem } from "@/types/reservations/ui";

interface ChatIndexPageProps {
  searchParams: Promise<{
    productPostUuid?: string;
    sellerMemberUuid?: string;
    sellerNickname?: string;
  }>;
}

/**
 * `/chat` 채팅 목록 — GET /api/v1/chat/rooms
 * `?productPostUuid`만 있으면 상품별 GET /product-posts/{uuid}/rooms
 * 방 상세는 `/chat/[uuid]`
 *
 * 상품 상세 「채팅하기」:
 * `?productPostUuid&sellerMemberUuid&sellerNickname`(닉은 상세 Member 조회분)
 * → `pendingProductChatEntry` → Chat `POST /rooms`의 sellerNickname
 *
 * 예약 카드: GET /api/v1/reservations/me → chatRoomId로 채팅 이동
 */
export default async function ChatIndexPage({
  searchParams,
}: ChatIndexPageProps) {
  await requireAuth("/chat");

  const params = await searchParams;
  const productPostUuid = params.productPostUuid?.trim() ?? "";
  const sellerMemberUuid = params.sellerMemberUuid?.trim() ?? "";
  const sellerNickname = params.sellerNickname?.trim() ?? "";

  const roomsPromise = (
    productPostUuid && !sellerMemberUuid
      ? listChatRoomsByProductPostService(productPostUuid)
      : listChatRoomsService()
  ).catch((): UiChatRoom[] => []);

  const reservationsPromise = listMyReservationsService().catch(
    (): UiReservationListItem[] => []
  );

  let pendingProductChatEntry: UiProductChatEntry | null = null;
  if (productPostUuid && sellerMemberUuid) {
    pendingProductChatEntry = await resolveProductChatEntryService({
      productPostUuid,
      sellerMemberUuid,
      sellerNickname,
    });
  }

  const [rooms, reservationItems] = await Promise.all([
    roomsPromise,
    reservationsPromise,
  ]);

  const roomTitleById = new Map(rooms.map((room) => [room.id, room.title]));
  const reservations: UiChatReservationCard[] = reservationItems.map((item) =>
    reservationCardFromListItem(
      item,
      roomTitleById.get(item.chatRoomId)?.trim() || item.placeName
    )
  );

  return (
    <ChatListTemplate
      rooms={rooms}
      reservations={reservations}
      pendingProductChatEntry={pendingProductChatEntry}
    />
  );
}
