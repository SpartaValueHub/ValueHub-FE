import { ChatListTemplate } from "@/components/templates/chat/ChatListTemplate";
import { CHAT_RESERVATIONS } from "@/constants/chat-page";
import { requireAuth } from "@/lib/session";
import { resolveProductChatEntryService } from "@/services/chat-entry.service";
import { listChatRoomsService } from "@/services/chat.service";
import type { UiChatRoom, UiProductChatEntry } from "@/types/chat/ui";

interface ChatIndexPageProps {
  searchParams: Promise<{
    productPostUuid?: string;
    sellerMemberUuid?: string;
    sellerNickname?: string;
  }>;
}

/**
 * `/chat` 채팅 목록 — GET /api/v1/chat/rooms
 * 방 상세는 `/chat/[uuid]`
 *
 * 상품 상세 「채팅하기」:
 * `?productPostUuid&sellerMemberUuid&sellerNickname`(닉은 상세 Member 조회분)
 * → `pendingProductChatEntry` → Chat `POST /rooms`의 sellerNickname
 */
export default async function ChatIndexPage({
  searchParams,
}: ChatIndexPageProps) {
  await requireAuth("/chat");

  const params = await searchParams;
  const productPostUuid = params.productPostUuid?.trim() ?? "";
  const sellerMemberUuid = params.sellerMemberUuid?.trim() ?? "";
  const sellerNickname = params.sellerNickname?.trim() ?? "";

  const roomsPromise = listChatRoomsService().catch((): UiChatRoom[] => []);

  let pendingProductChatEntry: UiProductChatEntry | null = null;
  if (productPostUuid && sellerMemberUuid) {
    pendingProductChatEntry = await resolveProductChatEntryService({
      productPostUuid,
      sellerMemberUuid,
      sellerNickname,
    });
  }

  const rooms = await roomsPromise;

  return (
    <ChatListTemplate
      rooms={rooms}
      reservations={CHAT_RESERVATIONS}
      pendingProductChatEntry={pendingProductChatEntry}
    />
  );
}
