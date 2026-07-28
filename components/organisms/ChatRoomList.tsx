import { ChatRoomItem } from "@/components/molecules/ChatRoomItem";
import type { UiChatRoom } from "@/types/chat/ui";

interface ChatRoomListProps {
  rooms: UiChatRoom[];
}

export function ChatRoomList({ rooms }: ChatRoomListProps) {
  if (rooms.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">채팅방이 없습니다.</p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {rooms.map((room) => (
        <li key={room.chatRoomUuid}>
          <ChatRoomItem room={room} />
        </li>
      ))}
    </ul>
  );
}
