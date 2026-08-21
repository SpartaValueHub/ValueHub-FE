"use client";

import { useState } from "react";

import { CategoryDropdown } from "@/components/molecules/form/CategoryDropdown";
import {
  Dialog,
  DialogCloseButton,
  DialogContent,
} from "@/components/molecules/overlay/Dialog";
import {
  TIME_HOUR_OPTIONS,
  TIME_MINUTE_OPTIONS,
  TIME_PERIOD_OPTIONS,
} from "@/constants/chat-page";
import type { UiTradeTimeValue } from "@/types/chat/ui";

interface TimePickerDialogProps {
  open: boolean;
  value?: UiTradeTimeValue;
  onOpenChange: (open: boolean) => void;
  onConfirm: (value: UiTradeTimeValue) => void;
}

/** Figma 거래 시간 설정 모달 — 오전/오후 · 시 · 분이 모두 선택되면 반영 */
export function TimePickerDialog({
  open,
  value,
  onOpenChange,
  onConfirm,
}: TimePickerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange} className="max-w-[420px]">
      {open ? (
        <TimePickerDialogBody
          value={value}
          onConfirm={(next) => {
            onConfirm(next);
            onOpenChange(false);
          }}
          onClose={() => onOpenChange(false)}
        />
      ) : null}
    </Dialog>
  );
}

function TimePickerDialogBody({
  value,
  onConfirm,
  onClose,
}: {
  value?: UiTradeTimeValue;
  onConfirm: (value: UiTradeTimeValue) => void;
  onClose: () => void;
}) {
  const [period, setPeriod] = useState<string | undefined>(value?.period);
  const [hour, setHour] = useState<string | undefined>(
    value ? String(value.hour) : undefined
  );
  const [minute, setMinute] = useState<string | undefined>(
    value ? String(value.minute) : undefined
  );

  function tryConfirm(
    nextPeriod = period,
    nextHour = hour,
    nextMinute = minute
  ) {
    if (!nextPeriod || nextHour == null || nextMinute == null) return;
    onConfirm({
      period: nextPeriod as UiTradeTimeValue["period"],
      hour: Number(nextHour),
      minute: Number(nextMinute),
    });
  }

  return (
    <DialogContent
      padded={false}
      showClose={false}
      className="flex flex-col items-start overflow-visible pb-5"
    >
      <div className="flex w-full items-center justify-end p-2.5">
        <DialogCloseButton onClose={onClose} className="static" />
      </div>
      <div className="flex w-full flex-col gap-2.5 px-5">
        <div className="flex gap-[18px]">
          <p className="w-[108px] font-sans text-sm text-[#323232]">
            오전/오후
          </p>
          <p className="w-[108px] font-sans text-sm text-[#323232]">시</p>
          <p className="w-[108px] font-sans text-sm text-[#323232]">분</p>
        </div>
        <div className="flex w-full gap-[18px]">
          <CategoryDropdown
            className="w-full min-w-0 flex-1"
            placeholder="오전"
            options={TIME_PERIOD_OPTIONS}
            value={period}
            onChange={(id) => {
              setPeriod(id);
              tryConfirm(id, hour, minute);
            }}
          />
          <CategoryDropdown
            className="w-full min-w-0 flex-1"
            placeholder="00"
            options={TIME_HOUR_OPTIONS}
            value={hour}
            onChange={(id) => {
              setHour(id);
              tryConfirm(period, id, minute);
            }}
          />
          <CategoryDropdown
            className="w-full min-w-0 flex-1"
            placeholder="00"
            options={TIME_MINUTE_OPTIONS}
            value={minute}
            onChange={(id) => {
              setMinute(id);
              tryConfirm(period, hour, id);
            }}
          />
        </div>
      </div>
    </DialogContent>
  );
}
