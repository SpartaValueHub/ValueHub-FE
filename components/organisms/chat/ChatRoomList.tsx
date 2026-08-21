import { Icon } from "@/components/atoms/icons";
import { ChatRoomItem } from "@/components/molecules/chat/ChatRoomItem";
import type { UiChatRoom } from "@/types/chat/ui";

interface ChatRoomListProps {
  rooms: UiChatRoom[];
  selectedId: string;
}

/** 좌측 채팅 목록 */
export function ChatRoomList({ rooms, selectedId }: ChatRoomListProps) {
  return (
    <aside className="flex h-full min-h-0 w-[280px] shrink-0 flex-col gap-5 overflow-hidden bg-[#fbefd8] pt-[30px] lg:w-[430px]">
      <div className="flex shrink-0 items-center gap-2.5 px-[30px]">
        <Icon name="chat" size={24} />
        <h1 className="font-sans text-xl text-[#323232]">채팅 목록</h1>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2.5 pb-5 lg:px-5">
        {rooms.map((room) => (
          <div
            key={room.id}
            className={
              room.id === selectedId ? "-mx-2.5 px-2.5 lg:-mx-2.5" : ""
            }
          >
            <ChatRoomItem room={room} selected={room.id === selectedId} />
          </div>
        ))}
      </div>
    </aside>
  );
}
