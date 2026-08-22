import { Button } from "@/components/atoms/button";

interface ChatReservationNoticeProps {
  dateLine: string;
  timePlaceLine: string;
  time?: string;
  onViewDetails?: () => void;
}

/** 거래 예약 완료 시스템 메시지 */
export function ChatReservationNotice({
  dateLine,
  timePlaceLine,
  time,
  onViewDetails,
}: ChatReservationNoticeProps) {
  return (
    <div className="flex items-end justify-end gap-[11px]">
      {time ? (
        <span className="shrink-0 font-sans text-[10px] text-[#606060] lg:text-xs">
          {time}
        </span>
      ) : null}
      <div className="flex flex-col items-start gap-3.5 rounded-[10px] border border-[#f2ca7b] px-3.5 py-2.5 text-left lg:p-3.5">
        <p className="font-sans text-sm text-black lg:text-base">
          거래가 예약되었습니다.
        </p>
        <div className="flex flex-col gap-1 font-sans text-xs leading-normal text-[#323232] lg:text-sm">
          <p>{dateLine}</p>
          <p>{timePlaceLine}</p>
        </div>
        {onViewDetails ? (
          <Button
            type="button"
            variant="modal"
            className="h-auto w-full rounded-[2px] border-0 bg-[#d9d9d9] px-3 py-1.5 text-xs"
            onClick={onViewDetails}
          >
            자세히보기
          </Button>
        ) : null}
      </div>
    </div>
  );
}
