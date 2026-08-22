import { ChatListTemplate } from "@/components/templates/chat/ChatListTemplate";
import { CHAT_RESERVATIONS, CHAT_ROOMS } from "@/constants/chat-page";

/** `/chat` 채팅 목록 — 방 상세는 `/chat/[uuid]` */
export default function ChatIndexPage() {
  return (
    <ChatListTemplate rooms={CHAT_ROOMS} reservations={CHAT_RESERVATIONS} />
  );
}
