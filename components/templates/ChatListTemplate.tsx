import Link from "next/link";

import { Section } from "@/components/atoms/Section";
import { ChatRoomList } from "@/components/organisms/ChatRoomList";
import type { UiChatRoom } from "@/types/chat/ui";

interface ChatListTemplateProps {
  rooms: UiChatRoom[];
}

export function ChatListTemplate({ rooms }: ChatListTemplateProps) {
  return (
    <Section className="flex flex-1 flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">채팅</h1>
          <p className="text-sm text-muted-foreground">
            더미 채팅방 목록입니다. 방을 선택해 대화를 시작하세요.
          </p>
        </div>
        <Link
          href="/"
          className="text-sm text-primary underline-offset-4 hover:underline"
        >
          홈으로
        </Link>
      </div>
      <ChatRoomList rooms={rooms} />
    </Section>
  );
}
