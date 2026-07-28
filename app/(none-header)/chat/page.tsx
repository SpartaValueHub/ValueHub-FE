import { ChatListTemplate } from "@/components/templates/ChatListTemplate";
import { listChatRoomsService } from "@/services/chat.service";

export default function ChatPage() {
  const rooms = listChatRoomsService();

  return <ChatListTemplate rooms={rooms} />;
}
