import { Icon } from "@/components/atoms/icons";
import { ChatRoomItem } from "@/components/molecules/chat/ChatRoomItem";
import { Empty } from "@/components/molecules/overlay/Empty";
import { cn } from "@/lib/utils";
import type { UiChatRoom } from "@/types/chat/ui";

interface ChatListSectionProps {
  rooms: UiChatRoom[];
  className?: string;
}

/** 채팅 목록 — 모바일 1열 / 데스크톱 제목 + 2열. 스크롤은 방 상세 왼쪽 목록과 동일 */
export function ChatListSection({ rooms, className }: ChatListSectionProps) {
  return (
    <section
      aria-label="채팅 목록"
      className={cn(
        "flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white lg:gap-2.5 lg:pt-[30px]",
        className
      )}
    >
      <div className="hidden shrink-0 flex-col gap-[30px] px-10 lg:flex">
        <div className="flex items-center gap-2.5">
          <Icon name="chat" size={20} />
          <h1 className="font-sans text-lg text-[#323232]">채팅 목록</h1>
        </div>
        <p className="font-sans text-sm tracking-[-0.28px] text-[#606060]">
          전체 채팅 {rooms.length}개
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-scroll overscroll-contain pb-24 lg:pb-[120px]">
        {rooms.length === 0 ? (
          <Empty
            title="아직 채팅이 없습니다"
            description="상품에서 채팅하기를 눌러 대화를 시작하세요."
          />
        ) : (
          <div className="grid grid-cols-1 content-start lg:grid-cols-2">
            {rooms.map((room) => (
              <ChatRoomItem key={room.id} room={room} variant="page" />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
