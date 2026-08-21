"use client";

import { useState } from "react";
import Image from "next/image";

import { Button } from "@/components/atoms/button";
import { Icon } from "@/components/atoms/icons";
import { ReservationFieldRow } from "@/components/molecules/chat/ReservationFieldRow";
import { DatePickerDialog } from "@/components/molecules/overlay/DatePickerDialog";
import { LocationRegisterDialog } from "@/components/molecules/overlay/LocationRegisterDialog";
import { TimePickerDialog } from "@/components/molecules/overlay/TimePickerDialog";
import { ConfirmModal } from "@/components/molecules/overlay/ConfirmModal";
import {
  CHAT_MAP_PREVIEW,
  formatReservationDate,
  formatReservationDateLine,
  formatReservationTime,
} from "@/constants/chat-page";
import type { UiTradeReservation, UiTradeTimeValue } from "@/types/chat/ui";

type PanelPhase = "empty" | "form" | "confirmed";

interface TradeReservationPanelProps {
  onReserved?: (reservation: UiTradeReservation) => void;
}

/** 우측 거래 예약 패널 — 없음 / 작성 / 완료 */
export function TradeReservationPanel({
  onReserved,
}: TradeReservationPanelProps) {
  const [phase, setPhase] = useState<PanelPhase>("empty");
  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState<UiTradeTimeValue | undefined>();
  const [placeName, setPlaceName] = useState("");
  const [dateOpen, setDateOpen] = useState(false);
  const [timeOpen, setTimeOpen] = useState(false);
  const [placeOpen, setPlaceOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const dateLabel = date ? formatReservationDate(date) : "";
  const timeLabel = time
    ? formatReservationTime(time.period, time.hour, time.minute)
    : "";
  const canSubmit = Boolean(date && time && placeName);

  function completeReservation() {
    if (!date || !time || !placeName) return;
    const reservation: UiTradeReservation = {
      date,
      dateLabel: formatReservationDate(date),
      timeLabel: formatReservationTime(time.period, time.hour, time.minute),
      placeName,
      mapImage: CHAT_MAP_PREVIEW,
    };
    onReserved?.(reservation);
    setPhase("confirmed");
    setConfirmOpen(false);
  }

  function reset() {
    setDate(undefined);
    setTime(undefined);
    setPlaceName("");
    setPhase("empty");
  }

  return (
    <aside className="flex h-full w-full max-w-[520px] shrink-0 flex-col bg-white px-[50px] py-[30px]">
      {phase === "empty" ? (
        <div className="flex h-full flex-col gap-[34px]">
          <div className="flex flex-col gap-1.5">
            <p className="font-sans text-xl text-[#323232]">
              예약된 거래가 없습니다.
            </p>
            <p className="font-sans text-base leading-[1.5] text-[#323232]">
              예약하기 버튼을 눌러 거래 예약을 진행하세요.
            </p>
          </div>
          <div className="flex flex-1 items-center justify-center">
            <Icon name="calendar-plus" size={80} />
          </div>
          <Button
            type="button"
            variant="modal"
            className="h-auto w-full py-3 text-lg"
            onClick={() => setPhase("form")}
          >
            예약하기
          </Button>
        </div>
      ) : (
        <div className="flex h-full flex-col gap-[30px]">
          <div className="flex flex-col gap-1.5">
            <h2 className="font-sans text-xl text-[#323232]">
              {phase === "confirmed"
                ? "거래가 예약되었습니다."
                : "거래 예약하기"}
            </h2>
            {phase === "form" ? (
              <p className="font-sans text-base leading-[1.5] text-[#323232]">
                거래 날짜, 시간, 장소를 설정하세요.
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2.5">
            <div className="flex flex-col gap-5 py-1.5">
              <ReservationFieldRow
                icon="calendar"
                iconSize={26}
                label={dateLabel}
                placeholder="날짜를 선택하세요"
                disabled={phase === "confirmed"}
                onClick={() => phase === "form" && setDateOpen(true)}
              />
              <ReservationFieldRow
                icon="clock"
                label={timeLabel}
                placeholder="시간을 선택하세요"
                disabled={phase === "confirmed"}
                onClick={() => phase === "form" && setTimeOpen(true)}
              />
              <ReservationFieldRow
                icon="location"
                label={placeName}
                placeholder="장소를 선택하세요"
                disabled={phase === "confirmed"}
                onClick={() => phase === "form" && setPlaceOpen(true)}
              />
            </div>
            {placeName ? (
              <div className="relative h-[130px] w-full overflow-hidden bg-[#d9d9d9]">
                <Image
                  src={CHAT_MAP_PREVIEW}
                  alt=""
                  fill
                  sizes="420px"
                  className="object-cover"
                />
              </div>
            ) : null}
          </div>

          <div className="mt-auto py-5">
            {phase === "form" ? (
              <Button
                type="button"
                variant="modal"
                className="h-auto w-full py-3 text-lg"
                disabled={!canSubmit}
                onClick={() => setConfirmOpen(true)}
              >
                예약하기
              </Button>
            ) : (
              <div className="flex gap-2.5">
                <Button
                  type="button"
                  variant="modal"
                  className="h-auto min-w-0 flex-1 py-3 text-lg"
                  onClick={reset}
                >
                  예약 취소
                </Button>
                <Button
                  type="button"
                  variant="modal"
                  className="h-auto min-w-0 flex-1 py-3 text-lg"
                  onClick={() => setPhase("form")}
                >
                  예약 수정
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      <DatePickerDialog
        open={dateOpen}
        value={date}
        onOpenChange={setDateOpen}
        onConfirm={setDate}
      />
      <TimePickerDialog
        open={timeOpen}
        value={time}
        onOpenChange={setTimeOpen}
        onConfirm={setTime}
      />
      <LocationRegisterDialog
        open={placeOpen}
        onOpenChange={setPlaceOpen}
        onConfirm={setPlaceName}
      />
      <ConfirmModal
        open={confirmOpen}
        title=""
        message={
          "거래 예약을 완료했습니다.\n게시글을 예약중으로 변경하시겠습니까?"
        }
        cancelLabel="취소"
        confirmLabel="확인"
        onCancel={completeReservation}
        onConfirm={completeReservation}
      />
    </aside>
  );
}

export function reservationNoticeLines(reservation: UiTradeReservation) {
  return {
    dateLine: formatReservationDateLine(reservation.date),
    timePlaceLine: `${reservation.timeLabel} ${reservation.placeName}`,
  };
}
