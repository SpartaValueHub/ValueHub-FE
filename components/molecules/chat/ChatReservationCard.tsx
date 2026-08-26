import Link from "next/link";

import { cn } from "@/lib/utils";
import type { UiChatReservationCard } from "@/types/chat/ui";

interface ChatReservationCardProps {
  reservation: UiChatReservationCard;
  className?: string;
}

/** 채팅 목록 거래 예약 카드 — 상품명 + 일시·장소 */
export function ChatReservationCard({
  reservation,
  className,
}: ChatReservationCardProps) {
  return (
    <Link
      href={`/chat/${reservation.roomId}`}
      className={cn(
        "flex w-[139px] shrink-0 flex-col overflow-hidden rounded border border-[#f2ca7b] lg:w-[150px]",
        className
      )}
    >
      <span className="flex min-w-0 items-center bg-[#f2ca7b] py-1.5 pr-2.5 pl-2.5">
        <span className="min-w-0 truncate font-sans text-xs text-[#323232] lg:text-sm">
          {reservation.title}
        </span>
      </span>

      <span className="flex flex-col gap-1 p-2.5 font-sans text-xs leading-normal text-[#323232]">
        <span className="flex gap-1.5">
          <span>{reservation.dateLabel}</span>
          <span className="tracking-[-0.24px]">{reservation.weekdayLabel}</span>
        </span>
        <span className="flex flex-col gap-1 tracking-[-0.24px]">
          <span className="hidden lg:inline">{reservation.timeLabel}</span>
          <span>{reservation.placeName}</span>
        </span>
      </span>
    </Link>
  );
}
