import { ChatBackBar } from "@/components/molecules/chat/ChatBackBar";
import { ChatRoomWorkspace } from "@/components/organisms/chat/ChatRoomWorkspace";
import { cn } from "@/lib/utils";
import type { UiChatMessage, UiChatRoom } from "@/types/chat/ui";
import type { UiReservation } from "@/types/reservations/ui";

interface ChatRoomTemplateProps {
  rooms: UiChatRoom[];
  roomId: string;
  messages: UiChatMessage[];
  hasMoreMessages?: boolean;
  reservation?: UiReservation | null;
  canManageReservation?: boolean;
  reservationLoadError?: string | null;
  className?: string;
}

export function ChatRoomTemplate({
  rooms,
  roomId,
  messages,
  hasMoreMessages = false,
  reservation = null,
  canManageReservation = false,
  reservationLoadError = null,
  className,
}: ChatRoomTemplateProps) {
  return (
    <main
      className={cn(
        "flex h-dvh min-h-0 flex-col overflow-hidden bg-[#fbefd8]",
        className
      )}
    >
      <ChatBackBar className="hidden lg:flex" href="/chat" />
      <ChatRoomWorkspace
        key={roomId}
        rooms={rooms}
        roomId={roomId}
        initialMessages={messages}
        initialHasMoreMessages={hasMoreMessages}
        initialReservation={reservation}
        canManageReservation={canManageReservation}
        reservationLoadError={reservationLoadError}
      />
    </main>
  );
}
