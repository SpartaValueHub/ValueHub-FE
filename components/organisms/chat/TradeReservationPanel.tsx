"use client";

import { useState } from "react";
import Image from "next/image";

import { Button } from "@/components/atoms/button";
import { Icon } from "@/components/atoms/icons";
import { StatusBadge } from "@/components/atoms/status-badge";
import { ReservationFieldRow } from "@/components/molecules/chat/ReservationFieldRow";
import { DatePickerDialog } from "@/components/molecules/overlay/DatePickerDialog";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/molecules/overlay/Dialog";
import { LocationRegisterDialog } from "@/components/molecules/overlay/LocationRegisterDialog";
import { TimePickerDialog } from "@/components/molecules/overlay/TimePickerDialog";
import { ConfirmModal } from "@/components/molecules/overlay/ConfirmModal";
import {
  CHAT_MAP_PREVIEW,
  formatReservationDate,
  formatReservationDateLine,
  formatReservationTime,
} from "@/constants/chat-page";
import { cn } from "@/lib/utils";
import type { UiTradeReservation, UiTradeTimeValue } from "@/types/chat/ui";

type PanelPhase = "empty" | "form" | "confirmed";

export type TradeReservationProduct = {
  title: string;
  thumbnail: string;
  price: number;
};

interface TradeReservationPanelProps {
  onReserved?: (reservation: UiTradeReservation) => void;
  onCancelReservation?: () => void;
  reservation?: UiTradeReservation | null;
  product?: TradeReservationProduct;
  variant?: "aside" | "dialog";
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  intent?: "form" | "detail";
  postReserved?: boolean;
}

/** 우측 거래 예약 패널 — 없음 / 작성 / 완료. 모바일은 Dialog */
export function TradeReservationPanel({
  onReserved,
  onCancelReservation,
  reservation = null,
  product,
  variant = "aside",
  open = true,
  onOpenChange,
  intent = "form",
  postReserved = false,
}: TradeReservationPanelProps) {
  const isDialog = variant === "dialog";
  const [draftActive, setDraftActive] = useState(
    () => isDialog && intent === "form"
  );
  const [date, setDate] = useState<Date | undefined>(() => reservation?.date);
  const [time, setTime] = useState<UiTradeTimeValue | undefined>(
    () => reservation?.time
  );
  const [placeName, setPlaceName] = useState(
    () => reservation?.placeName ?? ""
  );
  const [dateOpen, setDateOpen] = useState(false);
  const [timeOpen, setTimeOpen] = useState(false);
  const [placeOpen, setPlaceOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const phase: PanelPhase =
    reservation && !draftActive
      ? "confirmed"
      : draftActive
        ? "form"
        : isDialog
          ? "form"
          : "empty";

  const viewDate = phase === "form" ? date : (reservation?.date ?? date);
  const viewTime = phase === "form" ? time : (reservation?.time ?? time);
  const viewPlace =
    phase === "form" ? placeName : (reservation?.placeName ?? placeName);

  const dateLabel = viewDate ? formatReservationDate(viewDate) : "";
  const timeLabel = viewTime
    ? formatReservationTime(viewTime.period, viewTime.hour, viewTime.minute)
    : "";
  const canSubmit = Boolean(date && time && placeName);
  const showChevron = phase === "form";

  function startEdit() {
    if (reservation) {
      setDate(reservation.date);
      setTime(reservation.time);
      setPlaceName(reservation.placeName);
    }
    setDraftActive(true);
  }

  function completeReservation() {
    if (!date || !time || !placeName) return;
    const next: UiTradeReservation = {
      date,
      dateLabel: formatReservationDate(date),
      timeLabel: formatReservationTime(time.period, time.hour, time.minute),
      time,
      placeName,
      mapImage: CHAT_MAP_PREVIEW,
    };
    onReserved?.(next);
    setDraftActive(false);
    setConfirmOpen(false);
    if (isDialog) onOpenChange?.(false);
  }

  function handleCancelReservation() {
    setDate(undefined);
    setTime(undefined);
    setPlaceName("");
    setDraftActive(false);
    onCancelReservation?.();
    if (isDialog) onOpenChange?.(false);
  }

  const fields = (
    <div className="flex flex-col gap-2.5">
      <div
        className={cn("flex flex-col py-1.5", isDialog ? "gap-1.5" : "gap-5")}
      >
        <ReservationFieldRow
          icon="calendar"
          iconSize={26}
          label={dateLabel}
          placeholder="날짜를 선택하세요"
          disabled={phase === "confirmed"}
          showChevron={showChevron}
          onClick={() => phase === "form" && setDateOpen(true)}
        />
        <ReservationFieldRow
          icon="clock"
          label={timeLabel}
          placeholder="시간을 선택하세요"
          disabled={phase === "confirmed"}
          showChevron={showChevron}
          onClick={() => phase === "form" && setTimeOpen(true)}
        />
        <ReservationFieldRow
          icon="location"
          label={viewPlace}
          placeholder="장소를 선택하세요"
          disabled={phase === "confirmed"}
          showChevron={showChevron}
          onClick={() => phase === "form" && setPlaceOpen(true)}
        />
      </div>
      {viewPlace ? (
        <div
          className={cn(
            "relative w-full overflow-hidden bg-[#d9d9d9]",
            isDialog ? "h-[173px]" : "h-[130px]"
          )}
        >
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
  );

  const body =
    phase === "empty" && !isDialog ? (
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
          onClick={() => setDraftActive(true)}
        >
          예약하기
        </Button>
      </div>
    ) : (
      <div className="flex h-full flex-col gap-[30px]">
        <div className="flex flex-col gap-1.5">
          <h2
            className={cn(
              "font-sans text-[#323232]",
              isDialog && phase === "confirmed" ? "text-base" : "text-xl"
            )}
          >
            {phase === "confirmed" ? "거래가 예약되었습니다." : "거래 예약하기"}
          </h2>
          {phase === "form" ? (
            <p className="font-sans text-sm leading-[1.5] text-[#323232] lg:text-base">
              거래 날짜, 시간, 장소를 설정하세요.
            </p>
          ) : null}
        </div>

        {isDialog && phase === "confirmed" && product ? (
          <div className="flex items-center gap-2.5">
            <span className="relative size-[60px] shrink-0 overflow-hidden rounded-[4px] bg-[#868686]">
              <Image
                src={product.thumbnail}
                alt=""
                fill
                sizes="60px"
                className="object-cover"
              />
            </span>
            <div className="flex min-w-0 flex-1 flex-col justify-between self-stretch">
              <div className="flex items-start gap-1.5">
                <p className="min-w-0 flex-1 font-sans text-sm text-[#323232]">
                  {product.title}
                </p>
                {postReserved ? <StatusBadge status="reserved" /> : null}
              </div>
              <p className="font-sans text-lg font-medium text-[#323232]">
                {product.price.toLocaleString("ko-KR")}
                <span className="ml-0.5 text-base">원</span>
              </p>
            </div>
          </div>
        ) : null}

        {fields}

        <div className="mt-auto py-5">
          {phase === "form" ? (
            <Button
              type="button"
              variant="modal"
              className="h-auto w-full py-3 text-sm lg:text-lg"
              disabled={!canSubmit}
              onClick={() => setConfirmOpen(true)}
            >
              예약하기
            </Button>
          ) : (
            <div className="flex flex-col gap-2.5">
              <div className="flex gap-2.5">
                <Button
                  type="button"
                  variant="modal"
                  className="h-auto min-w-0 flex-1 py-3 text-sm lg:text-lg"
                  onClick={handleCancelReservation}
                >
                  예약 취소
                </Button>
                <Button
                  type="button"
                  variant="modal"
                  className="h-auto min-w-0 flex-1 py-3 text-sm lg:text-lg"
                  onClick={startEdit}
                >
                  예약 수정
                </Button>
              </div>
              {isDialog ? (
                <Button
                  type="button"
                  variant="modal"
                  className="h-auto w-full py-3 text-sm"
                  onClick={() => onOpenChange?.(false)}
                >
                  확인
                </Button>
              ) : null}
            </div>
          )}
        </div>
      </div>
    );

  const pickers = (
    <>
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
        className="max-w-[min(100%,360px)]"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={completeReservation}
      />
    </>
  );

  if (isDialog) {
    return (
      <>
        <Dialog
          open={open}
          onOpenChange={onOpenChange}
          className="max-w-[min(100%,360px)]"
        >
          <DialogContent
            padded={false}
            onClose={() => onOpenChange?.(false)}
            className="flex max-h-[min(90dvh,720px)] flex-col overflow-y-auto px-5 pt-2.5 pb-[30px]"
          >
            <DialogTitle className="sr-only">
              {phase === "confirmed"
                ? "거래가 예약되었습니다."
                : "거래 예약하기"}
            </DialogTitle>
            {body}
          </DialogContent>
        </Dialog>
        {pickers}
      </>
    );
  }

  return (
    <aside className="flex h-full w-full max-w-[520px] shrink-0 flex-col bg-white px-[50px] py-[30px]">
      {body}
      {pickers}
    </aside>
  );
}

export function reservationNoticeLines(reservation: UiTradeReservation) {
  return {
    dateLine: formatReservationDateLine(reservation.date),
    timePlaceLine: `${reservation.timeLabel} ${reservation.placeName}`,
  };
}
