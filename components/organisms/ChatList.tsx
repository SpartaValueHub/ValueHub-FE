import { ChatListItem } from "@/components/molecules/ChatListItem";
import type { UiChatMessage } from "@/types/chat/ui";

interface ChatListProps {
  messages: UiChatMessage[];
}

/** 채팅 메시지 리스트 — 내 글 / 상대 글 구분 */
export function ChatList({ messages }: ChatListProps) {
  const safeMessages = messages.filter((message) => message?.chatMessageUuid);

  if (safeMessages.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        아직 채팅이 없습니다.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {safeMessages.map((message) => (
        <li key={message.chatMessageUuid}>
          <ChatListItem message={message} />
        </li>
      ))}
    </ul>
  );
}
