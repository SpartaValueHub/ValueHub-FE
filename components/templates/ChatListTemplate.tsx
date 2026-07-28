import Link from "next/link";

import { Section } from "@/components/atoms/Section";
import { ChatRoomList } from "@/components/organisms/ChatRoomList";
import type { UiChatRoom } from "@/types/chat/ui";

interface ChatListTemplateProps {
  rooms: UiChatRoom[];
  accessToken?: string;
}

/** 채팅방 리스트 페이지 */
export function ChatListTemplate({
  rooms,
  accessToken,
}: ChatListTemplateProps) {
  return (
    <Section className="flex flex-1 flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">채팅 목록</h1>
          <p className="text-sm text-muted-foreground">
            새 메시지가 오면 미리보기와 순서가 최신순으로 갱신됩니다.
          </p>
        </div>
        <Link
          href="/"
          className="text-sm text-primary underline-offset-4 hover:underline"
        >
          홈으로
        </Link>
      </div>
      <ChatRoomList rooms={rooms} accessToken={accessToken} />
    </Section>
  );
}
