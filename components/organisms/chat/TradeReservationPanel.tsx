"use client";

import { useState } from "react";
import Image from "next/image";

import {
  cancelReservationAction,
  createReservationAction,
  updateReservationAction,
} from "@/actions/reservations";
import { Button } from "@/components/atoms/button";
import { Icon } from "@/components/atoms/icons";
import { StatusBadge } from "@/components/atoms/status-badge";
import { ReservationFieldRow } from "@/components/molecules/chat/ReservationFieldRow";
import { KakaoMapPicker } from "@/components/molecules/maps/KakaoMapPicker";
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
  dateAndTimeFromScheduledAt,
  formatReservationDate,
  formatReservationDateLine,
  formatReservationTime,
  scheduledAtFromDateAndTime,
} from "@/constants/chat-page";
import { hasKakaoMapAppKey } from "@/lib/kakao-maps";
import { cn } from "@/lib/utils";
import type { UiTradeTimeValue } from "@/types/chat/ui";
import type { UiReservation } from "@/types/reservations/ui";

type PanelPhase = "empty" | "form" | "confirmed";
type ConfirmKind = "create" | "update" | "cancel";

export type TradeReservationProduct = {
  title: string;
  thumbnail: string;
  price: number;
};

interface TradeReservationPanelProps {
  chatRoomId: string;
  canManage?: boolean;
  reservation?: UiReservation | null;
  loadError?: string | null;
  onReservationChange?: (reservation: UiReservation | null) => void;
  product?: TradeReservationProduct;
  variant?: "aside" | "dialog";
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  intent?: "form" | "detail";
  postReserved?: boolean;
}

function confirmedReservation(
  reservation: UiReservation | null | undefined
): UiReservation | null {
  if (!reservation || reservation.status !== "CONFIRMED") return null;
  return reservation;
}

function formFromReservation(reservation: UiReservation) {
  const parsed = dateAndTimeFromScheduledAt(reservation.scheduledAt);
  return {
    date: parsed.date,
    time: parsed.time,
    placeName: reservation.placeName,
    address: reservation.address,
    latitude: reservation.latitude,
    longitude: reservation.longitude,
  };
}

/** 우측 거래 예약 패널 — 없음 / 작성 / 완료. 모바일은 Dialog */
export function TradeReservationPanel({
  chatRoomId,
  canManage = false,
  onReservationChange,
  reservation = null,
  loadError = null,
  product,
  variant = "aside",
  open = true,
  onOpenChange,
  intent = "form",
  postReserved = false,
}: TradeReservationPanelProps) {
  const isDialog = variant === "dialog";
  const current = confirmedReservation(reservation);
  const [draftActive, setDraftActive] = useState(
    () => isDialog && intent === "form" && canManage && !current
  );
  const initialForm = current ? formFromReservation(current) : null;
  const [date, setDate] = useState<Date | undefined>(() => initialForm?.date);
  const [time, setTime] = useState<UiTradeTimeValue | undefined>(
    () => initialForm?.time
  );
  const [placeName, setPlaceName] = useState(
    () => initialForm?.placeName ?? ""
  );
  const [address, setAddress] = useState<string | null>(
    () => initialForm?.address ?? null
  );
  const [latitude, setLatitude] = useState<number | null>(
    () => initialForm?.latitude ?? null
  );
  const [longitude, setLongitude] = useState<number | null>(
    () => initialForm?.longitude ?? null
  );
  const [dateOpen, setDateOpen] = useState(false);
  const [timeOpen, setTimeOpen] = useState(false);
  const [placeOpen, setPlaceOpen] = useState(false);
  const [confirmKind, setConfirmKind] = useState<ConfirmKind | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(loadError);

  const phase: PanelPhase =
    current && !draftActive
      ? "confirmed"
      : draftActive && canManage
        ? "form"
        : isDialog && canManage && intent === "form"
          ? "form"
          : "empty";

  const viewDate = phase === "form" ? date : (initialForm?.date ?? date);
  const viewTime = phase === "form" ? time : (initialForm?.time ?? time);
  const viewPlace =
    phase === "form" ? placeName : (current?.placeName ?? placeName);
  const viewLat = phase === "form" ? latitude : (current?.latitude ?? latitude);
  const viewLng =
    phase === "form" ? longitude : (current?.longitude ?? longitude);

  const dateLabel = viewDate ? formatReservationDate(viewDate) : "";
  const timeLabel = viewTime
    ? formatReservationTime(viewTime.period, viewTime.hour, viewTime.minute)
    : "";
  const canSubmit = Boolean(
    canManage &&
    date &&
    time &&
    placeName.trim() &&
    latitude != null &&
    longitude != null
  );
  const showChevron = phase === "form";
  const showMap = Boolean(
    viewPlace && viewLat != null && viewLng != null && Number.isFinite(viewLat)
  );

  function startEdit() {
    if (!canManage || !current) return;
    const next = formFromReservation(current);
    setDate(next.date);
    setTime(next.time);
    setPlaceName(next.placeName);
    setAddress(next.address);
    setLatitude(next.latitude);
    setLongitude(next.longitude);
    setError(null);
    setDraftActive(true);
  }

  function startCreate() {
    if (!canManage) return;
    setError(null);
    setDraftActive(true);
  }

  async function submitReservation() {
    if (!date || !time || latitude == null || longitude == null) return;
    const scheduledAt = scheduledAtFromDateAndTime(date, time);
    const place = placeName.trim();
    if (!place) return;

    setPending(true);
    setError(null);
    try {
      if (current) {
        const result = await updateReservationAction({
          reservationId: current.reservationId,
          scheduledAt,
          placeName: place,
          latitude,
          longitude,
        });
        if (!result.ok) {
          setError(result.message);
          return;
        }
        onReservationChange?.(result.data);
      } else {
        const result = await createReservationAction({
          chatRoomId,
          scheduledAt,
          placeName: place,
          address,
          latitude,
          longitude,
        });
        if (!result.ok) {
          setError(result.message);
          return;
        }
        onReservationChange?.(result.data);
      }
      setDraftActive(false);
      setConfirmKind(null);
      if (isDialog) onOpenChange?.(false);
    } finally {
      setPending(false);
    }
  }

  async function submitCancel() {
    if (!canManage || !current) return;
    setPending(true);
    setError(null);
    try {
      const result = await cancelReservationAction({
        reservationId: current.reservationId,
      });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setDate(undefined);
      setTime(undefined);
      setPlaceName("");
      setAddress(null);
      setLatitude(null);
      setLongitude(null);
      setDraftActive(false);
      setConfirmKind(null);
      onReservationChange?.(null);
      if (isDialog) onOpenChange?.(false);
    } finally {
      setPending(false);
    }
  }

  const confirmCopy: Record<ConfirmKind, { message: string; label: string }> = {
    create: {
      message:
        "이 내용으로 거래 예약을 할까요?\n상품 거래 상태도 예약중으로 바꿀까요?",
      label: "예약하기",
    },
    update: {
      message: "이 내용으로 예약을 수정할까요?",
      label: "수정하기",
    },
    cancel: {
      message: "거래 예약을 취소할까요?",
      label: "예약 취소",
    },
  };

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
      {showMap ? (
        <div
          className={cn(
            "relative w-full overflow-hidden bg-[#d9d9d9]",
            isDialog ? "h-[173px] min-h-[173px]" : "h-[130px] min-h-[130px]"
          )}
        >
          {hasKakaoMapAppKey() ? (
            <KakaoMapPicker
              key={`${viewLat}-${viewLng}`}
              fill
              className="h-full w-full"
              initialLatitude={viewLat}
              initialLongitude={viewLng}
              interactive={false}
            />
          ) : (
            <Image
              src="/chat/map-preview.png"
              alt=""
              fill
              sizes="420px"
              className="object-cover"
            />
          )}
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
            {canManage
              ? "예약하기 버튼을 눌러 거래 예약을 진행하세요."
              : "판매자가 예약을 등록하면 여기에 표시됩니다."}
          </p>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <Icon name="calendar-plus" size={80} />
        </div>
        {error ? (
          <p className="font-sans text-sm text-[#ff5d31]" role="alert">
            {error}
          </p>
        ) : null}
        {canManage ? (
          <Button
            type="button"
            variant="modal"
            className="h-auto w-full py-3 text-lg"
            onClick={startCreate}
          >
            예약하기
          </Button>
        ) : null}
      </div>
    ) : (
      <div className="flex h-full flex-col gap-[30px]">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <h2
              className={cn(
                "font-sans text-[#323232]",
                isDialog && phase === "confirmed" ? "text-base" : "text-xl"
              )}
            >
              {phase === "confirmed"
                ? "거래가 예약되었습니다."
                : "거래 예약하기"}
            </h2>
            {phase === "confirmed" && postReserved ? (
              <StatusBadge status="reserved" className="shrink-0" />
            ) : null}
          </div>
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
                {postReserved ? (
                  <StatusBadge status="reserved" className="shrink-0" />
                ) : null}
              </div>
              <p className="font-sans text-lg font-medium text-[#323232]">
                {product.price.toLocaleString("ko-KR")}
                <span className="ml-0.5 text-base">원</span>
              </p>
            </div>
          </div>
        ) : null}

        {fields}

        {error ? (
          <p className="font-sans text-sm text-[#ff5d31]" role="alert">
            {error}
          </p>
        ) : null}

        <div className="mt-auto py-5">
          {phase === "form" ? (
            <Button
              type="button"
              variant="modal"
              className="h-auto w-full py-3 text-sm lg:text-lg"
              disabled={!canSubmit || pending}
              onClick={() => setConfirmKind(current ? "update" : "create")}
            >
              예약하기
            </Button>
          ) : (
            <div className="flex flex-col gap-2.5">
              {canManage ? (
                <div className="flex gap-2.5">
                  <Button
                    type="button"
                    variant="modal"
                    className="h-auto min-w-0 flex-1 py-3 text-sm lg:text-lg"
                    disabled={pending}
                    onClick={() => setConfirmKind("cancel")}
                  >
                    예약 취소
                  </Button>
                  <Button
                    type="button"
                    variant="modal"
                    className="h-auto min-w-0 flex-1 py-3 text-sm lg:text-lg"
                    disabled={pending}
                    onClick={startEdit}
                  >
                    예약 수정
                  </Button>
                </div>
              ) : null}
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
        initialPlaceName={placeName}
        initialLatitude={latitude}
        initialLongitude={longitude}
        onConfirm={(loc) => {
          setPlaceName(loc.placeName);
          setLatitude(loc.latitude);
          setLongitude(loc.longitude);
        }}
      />
      <ConfirmModal
        open={confirmKind != null}
        title=""
        message={confirmKind ? confirmCopy[confirmKind].message : ""}
        cancelLabel="취소"
        confirmLabel={confirmKind ? confirmCopy[confirmKind].label : "확인"}
        confirmPending={pending}
        className="max-w-[min(100%,360px)]"
        onCancel={() => {
          if (pending) return;
          setConfirmKind(null);
        }}
        onConfirm={() => {
          if (confirmKind === "cancel") {
            void submitCancel();
            return;
          }
          void submitReservation();
        }}
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

export function reservationNoticeLines(reservation: UiReservation) {
  const { date, time } = dateAndTimeFromScheduledAt(reservation.scheduledAt);
  const timeLabel = formatReservationTime(time.period, time.hour, time.minute);
  return {
    dateLine: formatReservationDateLine(date),
    timePlaceLine: `${timeLabel} ${reservation.placeName}`,
  };
}
