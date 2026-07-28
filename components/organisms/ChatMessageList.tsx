import { ChatMessageItem } from "@/components/molecules/ChatMessageItem";
import type { UiChatMessage } from "@/types/chat/ui";

interface ChatMessageListProps {
  messages: UiChatMessage[];
}

export function ChatMessageList({ messages }: ChatMessageListProps) {
  if (messages.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        아직 메시지가 없습니다. 첫 메시지를 보내보세요.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {messages.map((message) => (
        <ChatMessageItem key={message.chatMessageUuid} message={message} />
      ))}
    </div>
  );
}
