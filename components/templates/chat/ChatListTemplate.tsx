import { ChatBackBar } from "@/components/molecules/chat/ChatBackBar";
import { ChatListLive } from "@/components/organisms/chat/ChatListLive";
import { ChatProductEntry } from "@/components/organisms/chat/ChatProductEntry";
import { ChatReservationSection } from "@/components/organisms/chat/ChatReservationSection";
import { MainBottomNav } from "@/components/organisms/main/MainBottomNav";
import { cn } from "@/lib/utils";
import type {
  UiChatReservationCard,
  UiChatRoom,
  UiProductChatEntry,
} from "@/types/chat/ui";

interface ChatListTemplateProps {
  rooms: UiChatRoom[];
  reservations: UiChatReservationCard[];
  pendingProductChatEntry?: UiProductChatEntry | null;
  className?: string;
}

export function ChatListTemplate({
  rooms,
  reservations,
  pendingProductChatEntry = null,
  className,
}: ChatListTemplateProps) {
  return (
    <main
      className={cn(
        "flex h-dvh min-h-0 flex-col overflow-hidden bg-white",
        className
      )}
    >
      <ChatBackBar className="hidden lg:flex" />
      {pendingProductChatEntry ? (
        <ChatProductEntry entry={pendingProductChatEntry} />
      ) : null}
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row lg:overflow-hidden">
        <ChatReservationSection reservations={reservations} />
        <ChatListLive rooms={rooms} className="min-h-0" />
      </div>
      <MainBottomNav
        activeId="chat"
        floating={false}
        className="fixed inset-x-0 bottom-4 z-40 mx-auto bg-[rgba(224,224,224,0.3)] lg:hidden"
      />
    </main>
  );
}
