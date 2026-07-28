import Link from "next/link";

import { Section } from "@/components/atoms/Section";
import { ChatMessageForm } from "@/components/organisms/ChatMessageForm";
import { ChatMessageStream } from "@/components/organisms/ChatMessageStream";
import type { UiChatMessage, UiChatRoom } from "@/types/chat/ui";

interface ChatRoomTemplateProps {
  room: UiChatRoom;
  initialMessages?: UiChatMessage[];
  currentUserUuid: string;
  accessToken: string;
}

export function ChatRoomTemplate({
  room,
  initialMessages = [],
  currentUserUuid,
  accessToken,
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
        <div className="mb-4 min-h-0 flex-1 overflow-y-auto">
          <ChatMessageStream
            key={room.chatRoomUuid}
            chatRoomUuid={room.chatRoomUuid}
            initialMessages={initialMessages}
            currentUserUuid={currentUserUuid}
            accessToken={accessToken}
          />
        </div>
        <ChatMessageForm chatRoomUuid={room.chatRoomUuid} />
      </div>
    </Section>
  );
}
