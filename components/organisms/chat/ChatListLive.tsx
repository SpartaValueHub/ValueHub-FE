"use client";

import { useRef, useState } from "react";

import { ChatListSection } from "@/components/organisms/chat/ChatListSection";
import { ingestChatListPatch } from "@/hooks/chat/ingestChatListPatch";
import { useChatListSocket } from "@/hooks/chat/useChatListSocket";
import type { UiChatRoom } from "@/types/chat/ui";

interface ChatListLiveProps {
  rooms: UiChatRoom[];
  className?: string;
}

/** `/chat` 목록 — GET 스냅샷 + /user/queue/chat-list 한 줄 패치·새 방 insert */
export function ChatListLive({ rooms, className }: ChatListLiveProps) {
  const [list, setList] = useState(rooms);
  const fetchingRef = useRef(new Set<string>());

  useChatListSocket({
    onPatch: (patch) => {
      ingestChatListPatch(patch, setList, {
        fetching: fetchingRef.current,
      });
    },
  });

  return <ChatListSection rooms={list} className={className} />;
}
