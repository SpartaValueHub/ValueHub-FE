"use client";

import { useEffect, useMemo, useState } from "react";

import { parseChatMessageEventData } from "@/lib/chat/map";
import { applyRoomPreview, sortRoomsByLatest } from "@/lib/chat/rooms";
import { buildChatReactiveLatestEventSourceUrl } from "@/lib/chat/sse";
import type { UiChatRoom } from "@/types/chat/ui";

/**
 * 채팅방 목록 실시간 미리보기
 * - 각 방의 `/reactive/{uuid}/latest` SSE 구독
 * - 새 메시지 → lastMessage 갱신 + 최신순 재정렬
 */
export function useChatRoomsLive(
  initialRooms: UiChatRoom[],
  accessToken?: string
) {
  const [rooms, setRooms] = useState(() => sortRoomsByLatest(initialRooms));

  const roomKey = useMemo(
    () =>
      initialRooms
        .map((room) => room.chatRoomUuid)
        .slice()
        .sort()
        .join(","),
    [initialRooms]
  );

  useEffect(() => {
    setRooms(sortRoomsByLatest(initialRooms));
  }, [initialRooms, roomKey]);

  useEffect(() => {
    const uuids = roomKey ? roomKey.split(",") : [];
    if (uuids.length === 0) return;

    const sources = uuids.map((chatRoomUuid) => {
      const url = buildChatReactiveLatestEventSourceUrl(
        chatRoomUuid,
        accessToken
      );
      const eventSource = new EventSource(url);

      const handlePayload = (raw: string) => {
        const messages = parseChatMessageEventData(raw);
        if (messages.length === 0) return;

        setRooms((prev) => {
          let next = prev;
          for (const message of messages) {
            if (!message.chatRoomUuid) continue;
            next = applyRoomPreview(next, {
              chatRoomUuid: message.chatRoomUuid,
              lastMessage: message.message ?? "",
              lastMessageAt: message.createdAt ?? new Date().toISOString(),
            });
          }
          return next;
        });
      };

      eventSource.onmessage = (event) => {
        handlePayload(event.data);
      };

      eventSource.addEventListener("chat", (event) => {
        handlePayload((event as MessageEvent).data);
      });

      return eventSource;
    });

    return () => {
      for (const source of sources) {
        source.close();
      }
    };
  }, [accessToken, roomKey]);

  return rooms;
}
