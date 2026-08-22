import { Icon } from "@/components/atoms/icons";
import { ChatReservationCard } from "@/components/molecules/chat/ChatReservationCard";
import { cn } from "@/lib/utils";
import type { UiChatReservationCard } from "@/types/chat/ui";

interface ChatReservationSectionProps {
  reservations: UiChatReservationCard[];
  className?: string;
}

/** 채팅 목록 거래 예약 — 모바일 상단 고정 / 데스크톱 좌측 */
export function ChatReservationSection({
  reservations,
  className,
}: ChatReservationSectionProps) {
  return (
    <section
      aria-label="거래 예약"
      className={cn(
        "flex w-full shrink-0 flex-col gap-2.5 bg-[#fbefd8] px-5 pt-3 pb-5",
        "lg:h-full lg:w-[430px] lg:gap-[30px] lg:overflow-hidden lg:border-r lg:border-[#e0e0e0] lg:bg-white lg:p-[30px]",
        className
      )}
    >
      <div className="flex shrink-0 items-center gap-2.5">
        <Icon name="calendar-reserved" size={15} />
        <h2 className="font-sans text-sm leading-[1.5] text-[#323232] lg:text-lg">
          거래 예약 {reservations.length}건
        </h2>
      </div>

      <div className="-mx-5 flex flex-nowrap gap-2.5 overflow-x-auto px-5 lg:mx-0 lg:flex-wrap lg:gap-[30px] lg:overflow-visible lg:px-0">
        {reservations.map((reservation) => (
          <ChatReservationCard key={reservation.id} reservation={reservation} />
        ))}
      </div>
    </section>
  );
}
