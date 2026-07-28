"use client";

import { ChatList } from "@/components/organisms/ChatList";
import { useChatEventSource } from "@/hooks/useChatEventSource";
import type { UiChatMessage } from "@/types/chat/ui";

interface ChatMessageStreamProps {
  chatRoomUuid: string;
  initialMessages?: UiChatMessage[];
  currentUserUuid: string;
  accessToken: string;
}

export function ChatMessageStream({
  chatRoomUuid,
  initialMessages = [],
  currentUserUuid,
  accessToken,
}: ChatMessageStreamProps) {
  const { messages, status, errorMessage } = useChatEventSource(
    chatRoomUuid,
    initialMessages,
    currentUserUuid,
    accessToken
  );

  return (
    <div className="flex h-full flex-col gap-3">
      <p className="text-xs text-muted-foreground" role="status">
        {status === "connecting" && "EventSource 직접 연결 중..."}
        {status === "live" && "EventSource 실시간 수신 (직접 SSE)"}
        {status === "error" && (errorMessage ?? "EventSource 연결 오류")}
      </p>

      {status === "error" && messages.length === 0 ? (
        <p className="py-8 text-center text-sm text-destructive">
          {errorMessage}
        </p>
      ) : (
        <ChatList messages={messages} />
      )}
    </div>
  );
}
