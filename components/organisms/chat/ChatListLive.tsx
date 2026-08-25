"use client";

import { useState } from "react";

import { ChatListSection } from "@/components/organisms/chat/ChatListSection";
import { useChatListSocket } from "@/hooks/chat/useChatListSocket";
import { applyChatListPatch } from "@/lib/chat/map-list-patch";
import type { UiChatRoom } from "@/types/chat/ui";

interface ChatListLiveProps {
  rooms: UiChatRoom[];
  className?: string;
}

/** `/chat` 목록 — GET 스냅샷 + /user/queue/chat-list 한 줄 패치 */
export function ChatListLive({ rooms, className }: ChatListLiveProps) {
  const [list, setList] = useState(rooms);

  useChatListSocket({
    onPatch: (patch) => {
      setList((current) => applyChatListPatch(current, patch));
    },
  });

  return <ChatListSection rooms={list} className={className} />;
}
