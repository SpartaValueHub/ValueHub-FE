import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";
import type { UiChatRoom } from "@/types/chat/ui";

function formatUnread(count: number) {
  return count > 99 ? "99+" : String(count);
}

interface ChatRoomItemProps {
  room: UiChatRoom;
  selected?: boolean;
}

/** 채팅 목록 행 — 썸네일 + 제목 + 시각 + 미읽음 */
export function ChatRoomItem({ room, selected }: ChatRoomItemProps) {
  return (
    <Link
      href={`/chat/${room.id}`}
      aria-current={selected ? "page" : undefined}
      className={cn(
        "flex w-full items-center justify-between px-2.5 py-3.5 text-left",
        selected && "rounded-[20px] bg-white pl-5 pr-2.5"
      )}
    >
      <span className="flex min-w-0 items-center gap-2.5">
        <span className="relative size-[43px] shrink-0 overflow-hidden rounded-[2px] bg-[#868686]">
          <Image
            src={room.thumbnail}
            alt=""
            fill
            sizes="43px"
            className="object-cover"
          />
        </span>
        <span className="flex min-w-0 flex-col gap-[5px] font-sans text-xs tracking-[-0.24px]">
          <span className="line-clamp-1 text-[#323232]">{room.title}</span>
          <span className="text-[#ababab]">{room.timeAgo}</span>
        </span>
      </span>
      {room.unreadCount > 0 ? (
        <span className="inline-flex min-w-[18px] shrink-0 items-center justify-center rounded-[18px] bg-[#e97c00] px-[5px] py-1 font-sans text-xs tracking-[-0.24px] text-white">
          {formatUnread(room.unreadCount)}
        </span>
      ) : (
        <span className="size-4 shrink-0" aria-hidden />
      )}
    </Link>
  );
}
