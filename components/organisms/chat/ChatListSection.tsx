import { Icon } from "@/components/atoms/icons";
import { ChatRoomItem } from "@/components/molecules/chat/ChatRoomItem";
import { cn } from "@/lib/utils";
import type { UiChatRoom } from "@/types/chat/ui";

interface ChatListSectionProps {
  rooms: UiChatRoom[];
  className?: string;
}

/** 채팅 목록 — 모바일 1열 / 데스크톱 제목 + 2열 */
export function ChatListSection({ rooms, className }: ChatListSectionProps) {
  return (
    <section
      aria-label="채팅 목록"
      className={cn(
        "flex min-h-0 min-w-0 flex-1 flex-col bg-white pb-24 lg:gap-2.5 lg:pt-[30px] lg:pb-[120px]",
        className
      )}
    >
      <div className="hidden flex-col gap-[30px] px-10 lg:flex">
        <div className="flex items-center gap-2.5">
          <Icon name="chat" size={20} />
          <h1 className="font-sans text-lg text-[#323232]">채팅 목록</h1>
        </div>
        <p className="font-sans text-sm tracking-[-0.28px] text-[#606060]">
          전체 채팅 {rooms.length}개
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2">
        {rooms.map((room) => (
          <ChatRoomItem key={room.id} room={room} variant="page" />
        ))}
      </div>
    </section>
  );
}
