"use client";

import { useState } from "react";

import { ChatListSection } from "@/components/organisms/chat/ChatListSection";
import { useChatSocket } from "@/hooks/chat/useChatSocket";
import { applyChatListPreview } from "@/lib/chat/map-ui";
import type { UiChatRoom } from "@/types/chat/ui";

interface ChatListLiveProps {
  rooms: UiChatRoom[];
  className?: string;
}

/** 목록 + /user/queue/chat-list 한 줄 패치 */
export function ChatListLive({
  rooms: initialRooms,
  className,
}: ChatListLiveProps) {
  const [rooms, setRooms] = useState(initialRooms);

  useChatSocket({
    onListPreview: (preview) => {
      setRooms((current) => {
        const index = current.findIndex((room) => room.id === preview.roomId);
        if (index < 0) return current;
        const next = [...current];
        next[index] = applyChatListPreview(next[index], preview);
        next.sort((a, b) => {
          if (a.id === preview.roomId) return -1;
          if (b.id === preview.roomId) return 1;
          return 0;
        });
        return next;
      });
    },
  });

  return <ChatListSection rooms={rooms} className={className} />;
}
