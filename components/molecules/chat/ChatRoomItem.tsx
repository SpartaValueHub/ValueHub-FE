import Image from "next/image";
import Link from "next/link";

import { Icon } from "@/components/atoms/icons";
import { cn } from "@/lib/utils";
import type { UiChatRoom } from "@/types/chat/ui";

function formatUnread(count: number) {
  return count > 99 ? "99+" : String(count);
}

const unreadBadgeClass =
  "inline-flex h-[18px] min-w-[18px] shrink-0 items-center justify-center rounded-[18px] bg-[#e97c00] px-[3px] font-sans text-xs tracking-[-0.24px] text-white";

type ChatRoomItemVariant = "sidebar" | "page";

interface ChatRoomItemProps {
  room: UiChatRoom;
  selected?: boolean;
  variant?: ChatRoomItemVariant;
}

function ReservedChip({ className }: { className?: string }) {
  return (
    <span
      aria-label="예약됨"
      className={cn(
        "inline-flex h-[15px] shrink-0 items-center rounded-[31px] border border-[#efbb55] bg-[#f5f5f5] px-2 lg:bg-transparent",
        className
      )}
    >
      <Icon name="calendar-reserved" size={9} />
    </span>
  );
}

function UnreadBadge({ count }: { count: number }) {
  if (count <= 0) {
    return <span className="size-[18px] shrink-0" aria-hidden />;
  }
  return <span className={unreadBadgeClass}>{formatUnread(count)}</span>;
}

/** 채팅 목록 행 — 썸네일 + 제목 + 시각 + 미읽음 */
export function ChatRoomItem({
  room,
  selected,
  variant = "sidebar",
}: ChatRoomItemProps) {
  if (variant === "page") {
    return (
      <Link
        href={`/chat/${room.id}`}
        className="flex w-full items-center justify-between px-5 py-3 text-left lg:px-10 lg:py-4"
      >
        <span className="flex min-w-0 items-center gap-1.5 lg:gap-2.5">
          <span className="relative size-[54px] shrink-0 overflow-hidden rounded-[2px] bg-[#868686]">
            <Image
              src={room.thumbnail}
              alt=""
              fill
              sizes="54px"
              className="rounded-[2px] object-cover"
            />
          </span>
          <span className="flex min-w-0 flex-col gap-1 lg:min-h-[54px] lg:justify-between lg:py-1.5">
            <span className="flex items-center gap-1.5">
              <span className="line-clamp-1 font-sans text-xs tracking-[-0.24px] text-[#323232] lg:text-sm lg:tracking-[-0.28px]">
                {room.title}
              </span>
              {room.reserved ? (
                <ReservedChip className="hidden lg:inline-flex" />
              ) : null}
            </span>
            {room.lastMessage ? (
              <span className="line-clamp-1 font-sans text-xs tracking-[-0.24px] text-[#868686]">
                {room.lastMessage}
              </span>
            ) : null}
            <span className="flex items-center gap-[5px] lg:hidden">
              <span className="font-sans text-xs tracking-[-0.24px] text-[#ababab]">
                {room.timeAgo}
              </span>
              {room.reserved ? <ReservedChip /> : null}
            </span>
          </span>
        </span>
        <span className="flex shrink-0 flex-col items-end gap-2.5">
          <span className="hidden font-sans text-xs tracking-[-0.24px] text-[#ababab] lg:inline">
            {room.timeAgo}
          </span>
          <UnreadBadge count={room.unreadCount} />
        </span>
      </Link>
    );
  }

  return (
    <Link
      href={`/chat/${room.id}`}
      aria-current={selected ? "page" : undefined}
      className={cn(
        "flex w-full items-center justify-between px-2.5 py-3.5 text-left",
        selected && "rounded-[20px] bg-white pr-2.5 pl-5"
      )}
    >
      <span className="flex min-w-0 items-center gap-2.5">
        <span className="relative size-[43px] shrink-0 overflow-hidden rounded-[2px] bg-[#868686]">
          <Image
            src={room.thumbnail}
            alt=""
            fill
            sizes="43px"
            className="rounded-[2px] object-cover"
          />
        </span>
        <span className="flex min-w-0 flex-col gap-[5px] font-sans text-xs tracking-[-0.24px]">
          <span className="line-clamp-1 text-[#323232]">{room.title}</span>
          {room.lastMessage ? (
            <span className="line-clamp-1 text-[#868686]">
              {room.lastMessage}
            </span>
          ) : null}
          <span className="text-[#ababab]">{room.timeAgo}</span>
        </span>
      </span>
      <UnreadBadge count={room.unreadCount} />
    </Link>
  );
}
