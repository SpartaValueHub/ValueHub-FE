"use client";

import { useEffect, useState } from "react";

import { buildChatReactiveEventSourceUrl } from "@/lib/chat/sse";
import {
  mapChatMessage,
  parseChatMessageEventData,
} from "@/lib/chat/map";
import type { UiChatMessage } from "@/types/chat/ui";

type StreamStatus = "connecting" | "live" | "error";

function upsertMessages(
  prev: UiChatMessage[],
  incoming: UiChatMessage[]
): UiChatMessage[] {
  const map = new Map(
    prev
      .filter((item) => item?.chatMessageUuid)
      .map((item) => [item.chatMessageUuid, item])
  );

  for (const message of incoming) {
    if (!message?.chatMessageUuid) continue;
    map.set(message.chatMessageUuid, message);
  }

  return Array.from(map.values()).sort((a, b) =>
    (a.createdAt ?? "").localeCompare(b.createdAt ?? "")
  );
}

/**
 * 브라우저 EventSource → CHAT API 직접 구독
 * 예: http://localhost:8082/api/v1/chat/reactive/{chatRoomUuid}
 *
 * (이전 Next proxy 방식은 lib/api/backups/chat-reactive-proxy.route.ts 참고)
 */
export function useChatEventSource(
  chatRoomUuid: string,
  initialMessages: UiChatMessage[] = [],
  currentUserUuid?: string,
  accessToken?: string
) {
  const [messages, setMessages] = useState<UiChatMessage[]>(() =>
    initialMessages.map((message) => ({
      ...message,
      isMine: Boolean(
        currentUserUuid &&
          message.senderUuid?.trim() === currentUserUuid.trim()
      ),
    }))
  );
  const [status, setStatus] = useState<StreamStatus>("connecting");
  const [errorMessage, setErrorMessage] = useState<string>();

  useEffect(() => {
    if (!chatRoomUuid) return;

    const url = buildChatReactiveEventSourceUrl(chatRoomUuid, accessToken);
    const eventSource = new EventSource(url);

    setStatus("connecting");
    setErrorMessage(undefined);

    const handlePayload = (raw: string) => {
      try {
        const apiMessages = parseChatMessageEventData(raw);
        const uiMessages = apiMessages.map((message) =>
          mapChatMessage(message, currentUserUuid)
        );
        setMessages((prev) => upsertMessages(prev, uiMessages));
        setStatus("live");
      } catch {
        setStatus("error");
        setErrorMessage("채팅 이벤트 파싱에 실패했습니다.");
      }
    };

    eventSource.onopen = () => {
      setStatus("live");
    };

    eventSource.onmessage = (event) => {
      handlePayload(event.data);
    };

    eventSource.addEventListener("chat", (event) => {
      handlePayload((event as MessageEvent).data);
    });

    eventSource.onerror = () => {
      setStatus("error");
      setErrorMessage("채팅 스트림 연결이 끊어졌습니다.");
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [accessToken, chatRoomUuid, currentUserUuid]);

  return { messages, status, errorMessage };
}
