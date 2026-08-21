import { ChatBackBar } from "@/components/molecules/chat/ChatBackBar";
import { ChatRoomWorkspace } from "@/components/organisms/chat/ChatRoomWorkspace";
import { cn } from "@/lib/utils";
import type { UiChatMessage, UiChatRoom } from "@/types/chat/ui";

interface ChatRoomTemplateProps {
  rooms: UiChatRoom[];
  roomId: string;
  messages: UiChatMessage[];
  className?: string;
}

export function ChatRoomTemplate({
  rooms,
  roomId,
  messages,
  className,
}: ChatRoomTemplateProps) {
  return (
    <main
      className={cn(
        "flex h-dvh min-h-0 flex-col overflow-hidden bg-[#fbefd8]",
        className
      )}
    >
      <ChatBackBar />
      <ChatRoomWorkspace
        key={roomId}
        rooms={rooms}
        roomId={roomId}
        initialMessages={messages}
      />
    </main>
  );
}
