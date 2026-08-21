"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/atoms/button";
import { Icon } from "@/components/atoms/icons";
import {
  Dialog,
  DialogCloseButton,
  DialogContent,
} from "@/components/molecules/overlay/Dialog";
import { cn } from "@/lib/utils";

const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"] as const;

type CalendarCell = {
  date: Date;
  day: number;
  inMonth: boolean;
};

function monthCells(year: number, month: number): CalendarCell[] {
  const first = new Date(year, month, 1);
  const startWeekday = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();
  const cells: CalendarCell[] = [];

  for (let index = 0; index < startWeekday; index += 1) {
    const day = prevMonthDays - startWeekday + index + 1;
    cells.push({
      date: new Date(year, month - 1, day),
      day,
      inMonth: false,
    });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({ date: new Date(year, month, day), day, inMonth: true });
  }

  while (cells.length % 7 !== 0) {
    const day = cells.length - (startWeekday + daysInMonth) + 1;
    cells.push({
      date: new Date(year, month + 1, day),
      day,
      inMonth: false,
    });
  }

  return cells;
}

function sameDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

interface DatePickerDialogProps {
  open: boolean;
  value?: Date;
  onOpenChange: (open: boolean) => void;
  onConfirm: (date: Date) => void;
}

/** Figma 거래 예약 캘린더 모달 */
export function DatePickerDialog({
  open,
  value,
  onOpenChange,
  onConfirm,
}: DatePickerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange} className="max-w-[360px]">
      {open ? (
        <DatePickerDialogBody
          value={value}
          onConfirm={onConfirm}
          onClose={() => onOpenChange(false)}
        />
      ) : null}
    </Dialog>
  );
}

function DatePickerDialogBody({
  value,
  onConfirm,
  onClose,
}: {
  value?: Date;
  onConfirm: (date: Date) => void;
  onClose: () => void;
}) {
  const initial = value ?? new Date();
  const [cursor, setCursor] = useState(
    () => new Date(initial.getFullYear(), initial.getMonth(), 1)
  );
  const [draft, setDraft] = useState<Date>(initial);

  const cells = useMemo(
    () => monthCells(cursor.getFullYear(), cursor.getMonth()),
    [cursor]
  );
  const weeks: CalendarCell[][] = [];
  for (let index = 0; index < cells.length; index += 7) {
    weeks.push(cells.slice(index, index + 7));
  }

  return (
    <DialogContent
      padded={false}
      showClose={false}
      className="flex flex-col items-center gap-[30px] p-2.5"
    >
      <div className="flex w-full flex-col items-center">
        <div className="flex w-full items-center justify-end">
          <DialogCloseButton onClose={onClose} className="static" />
        </div>
        <div className="flex items-center gap-[30px] pl-[50px]">
          <p className="font-sans text-base tracking-[0.8px] text-[#121212]">
            {cursor.getFullYear()}.
            {String(cursor.getMonth() + 1).padStart(2, "0")}
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="이전 달"
              className="flex size-5 items-center justify-center text-[#323232]"
              onClick={() =>
                setCursor(
                  new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1)
                )
              }
            >
              <Icon name="chevron-left" size={20} />
            </button>
            <button
              type="button"
              aria-label="다음 달"
              className="flex size-5 items-center justify-center text-[#323232]"
              onClick={() =>
                setCursor(
                  new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1)
                )
              }
            >
              <Icon name="chevron-right" size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex w-[310px] items-center justify-between text-center text-sm">
        {WEEKDAY_LABELS.map((label, index) => (
          <span
            key={label}
            className={cn(
              "w-4",
              index === 0 ? "text-[#e75b52]" : "text-[#121212]"
            )}
          >
            {label}
          </span>
        ))}
      </div>

      <div className="flex w-[310px] flex-col gap-3.5">
        {weeks.map((week) => (
          <div
            key={week[0].date.toISOString()}
            className="flex items-center justify-between"
          >
            {week.map((cell, index) => {
              const selected = sameDay(cell.date, draft);
              const sunday = index === 0;

              return (
                <button
                  key={cell.date.toISOString()}
                  type="button"
                  disabled={!cell.inMonth}
                  onClick={() => setDraft(cell.date)}
                  className={cn(
                    "flex w-[20px] items-center justify-center font-sans text-sm leading-[1.4]",
                    !cell.inMonth && "text-[#d0d0d0]",
                    cell.inMonth && sunday && "text-[#e75b52]",
                    cell.inMonth && !sunday && "text-[#121212]",
                    selected &&
                      "rounded-[19px] bg-[#f9f0e6] font-medium text-[#e97c00]"
                  )}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <div className="flex w-full flex-col items-center py-5">
        <Button
          type="button"
          variant="modal"
          size="modal"
          className="w-[284px]"
          onClick={() => {
            onConfirm(draft);
            onClose();
          }}
        >
          확인
        </Button>
      </div>
    </DialogContent>
  );
}
