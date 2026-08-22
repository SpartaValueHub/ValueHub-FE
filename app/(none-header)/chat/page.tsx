import { ChatListTemplate } from "@/components/templates/chat/ChatListTemplate";
import { requireAuth } from "@/lib/session";
import { listChatRoomsService } from "@/services/chat.service";
import { resolveProductChatEntryService } from "@/services/chat-entry.service";
import type { UiChatRoom, UiProductChatEntry } from "@/types/chat/ui";

interface ChatIndexPageProps {
  searchParams: Promise<{
    productPostUuid?: string;
    sellerMemberUuid?: string;
    sellerNickname?: string;
  }>;
}

/** `/chat` 채팅 목록 — 방 상세는 `/chat/[uuid]` */
export default async function ChatIndexPage({
  searchParams,
}: ChatIndexPageProps) {
  await requireAuth("/chat");
  const params = await searchParams;
  const productPostUuid = params.productPostUuid?.trim() ?? "";
  const sellerMemberUuid = params.sellerMemberUuid?.trim() ?? "";
  const sellerNickname = params.sellerNickname?.trim() ?? "";

  let rooms: UiChatRoom[] = [];
  try {
    rooms = await listChatRoomsService();
  } catch {
    rooms = [];
  }

  let pendingProductChatEntry: UiProductChatEntry | null = null;
  if (productPostUuid && sellerMemberUuid) {
    pendingProductChatEntry = await resolveProductChatEntryService({
      productPostUuid,
      sellerMemberUuid,
      sellerNickname,
    });
  }

  return (
    <ChatListTemplate
      rooms={rooms}
      reservations={[]}
      pendingProductChatEntry={pendingProductChatEntry}
    />
  );
}
