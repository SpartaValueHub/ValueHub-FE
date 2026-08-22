import { ChatListTemplate } from "@/components/templates/chat/ChatListTemplate";
import { CHAT_RESERVATIONS, CHAT_ROOMS } from "@/constants/chat-page";
import { resolveProductChatEntryService } from "@/services/chat-entry.service";
import type { UiProductChatEntry } from "@/types/chat/ui";

interface ChatIndexPageProps {
  searchParams: Promise<{
    productPostUuid?: string;
    sellerMemberUuid?: string;
  }>;
}

/**
 * `/chat` 채팅 목록 — 방 상세는 `/chat/[uuid]`
 *
 * 상품 상세 「채팅하기」:
 * `?productPostUuid&sellerMemberUuid` → Member profile로 닉 확정
 * → `pendingProductChatEntry` (Chat POST /rooms 입력)
 */
export default async function ChatIndexPage({
  searchParams,
}: ChatIndexPageProps) {
  const params = await searchParams;
  const productPostUuid = params.productPostUuid?.trim() ?? "";
  const sellerMemberUuid = params.sellerMemberUuid?.trim() ?? "";

  let pendingProductChatEntry: UiProductChatEntry | null = null;
  if (productPostUuid && sellerMemberUuid) {
    pendingProductChatEntry = await resolveProductChatEntryService({
      productPostUuid,
      sellerMemberUuid,
    });
  }

  return (
    <ChatListTemplate
      rooms={CHAT_ROOMS}
      reservations={CHAT_RESERVATIONS}
      pendingProductChatEntry={pendingProductChatEntry}
    />
  );
}
