import Link from "next/link";

import { Section } from "@/components/atoms/Section";
import { ChatMessageForm } from "@/components/organisms/ChatMessageForm";
import { ChatMessageList } from "@/components/organisms/ChatMessageList";
import type { UiChatMessage, UiChatRoom } from "@/types/chat/ui";

interface ChatRoomTemplateProps {
  room: UiChatRoom;
  messages: UiChatMessage[];
  errorMessage?: string;
}

export function ChatRoomTemplate({
  room,
  messages,
  errorMessage,
}: ChatRoomTemplateProps) {
  return (
    <Section className="flex min-h-[70vh] flex-1 flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{room.title}</h1>
          <p className="text-sm text-muted-foreground">{room.chatRoomUuid}</p>
        </div>
        <Link
          href="/chat"
          className="text-sm text-primary underline-offset-4 hover:underline"
        >
          목록으로
        </Link>
      </div>

      <div className="flex flex-1 flex-col rounded-xl border p-4">
        <div className="mb-4 flex-1 overflow-y-auto">
          {errorMessage ? (
            <p className="py-8 text-center text-sm text-destructive">
              {errorMessage}
            </p>
          ) : (
            <ChatMessageList messages={messages} />
          )}
        </div>
        <ChatMessageForm chatRoomUuid={room.chatRoomUuid} />
      </div>
    </Section>
  );
}
