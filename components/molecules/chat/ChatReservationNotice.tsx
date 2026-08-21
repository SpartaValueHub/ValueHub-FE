interface ChatReservationNoticeProps {
  dateLine: string;
  timePlaceLine: string;
  time?: string;
}

/** 거래 예약 완료 시스템 메시지 */
export function ChatReservationNotice({
  dateLine,
  timePlaceLine,
  time,
}: ChatReservationNoticeProps) {
  return (
    <div className="flex items-end justify-end gap-[11px]">
      {time ? (
        <span className="shrink-0 font-sans text-xs text-[#606060]">
          {time}
        </span>
      ) : null}
      <div className="flex flex-col items-start gap-3.5 rounded-[10px] border border-[#f2ca7b] p-3.5 text-left">
        <p className="font-sans text-base text-black">거래가 예약되었습니다.</p>
        <div className="flex flex-col gap-1 font-sans text-sm leading-normal text-[#323232]">
          <p>{dateLine}</p>
          <p>{timePlaceLine}</p>
        </div>
      </div>
    </div>
  );
}
