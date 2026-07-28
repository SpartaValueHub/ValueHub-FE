"use client";

import { ChatRoomItem } from "@/components/molecules/ChatRoomItem";
import { useChatRoomsLive } from "@/hooks/useChatRoomsLive";
import type { UiChatRoom } from "@/types/chat/ui";

interface ChatRoomListProps {
  rooms: UiChatRoom[];
  accessToken?: string;
}

export function ChatRoomList({ rooms, accessToken }: ChatRoomListProps) {
  const liveRooms = useChatRoomsLive(rooms, accessToken);

  if (liveRooms.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">채팅방이 없습니다.</p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {liveRooms.map((room) => (
        <li key={room.chatRoomUuid}>
          <ChatRoomItem room={room} />
        </li>
      ))}
    </ul>
  );
}
