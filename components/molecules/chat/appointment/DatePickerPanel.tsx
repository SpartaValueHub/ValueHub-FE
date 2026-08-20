"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/atoms/button";
import { APPOINTMENT_WEEKDAYS } from "@/constants/chat-appointment";
import { formatAppointmentMonth } from "@/lib/chat/appointment-format";
import { cn } from "@/lib/utils";

interface DatePickerPanelProps {
  value: Date | null;
  onChange: (date: Date) => void;
  onConfirm?: () => void;
  confirmLabel?: string;
}

export function DatePickerPanel({
  value,
  onChange,
  onConfirm,
  confirmLabel = "확인",
}: DatePickerPanelProps) {
  const [visibleMonth, setVisibleMonth] = useState(
    () => value ?? new Date(2026, 7, 1)
  );

  const cells = useMemo(() => {
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    return Array.from({ length: 42 }, (_, index) => {
      const day = index - firstDay + 1;
      if (day < 1 || day > daysInMonth) return null;
      return new Date(year, month, day);
    });
  }, [visibleMonth]);

  function shiftMonth(delta: number) {
    setVisibleMonth(
      (current) =>
        new Date(current.getFullYear(), current.getMonth() + delta, 1)
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <button
          type="button"
          aria-label="이전 달"
          onClick={() => shiftMonth(-1)}
          className="p-1 text-[#868686] hover:text-[#323232]"
        >
          <ChevronLeft className="size-5" />
        </button>
        <span className="font-sans text-base font-medium text-[#323232]">
          {formatAppointmentMonth(visibleMonth)}
        </span>
        <button
          type="button"
          aria-label="다음 달"
          onClick={() => shiftMonth(1)}
          className="p-1 text-[#868686] hover:text-[#323232]"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {APPOINTMENT_WEEKDAYS.map((day) => (
          <span key={day} className="py-1 font-sans text-xs text-[#868686]">
            {day}
          </span>
        ))}
        {cells.map((date, index) =>
          date ? (
            <button
              key={date.toISOString()}
              type="button"
              onClick={() => onChange(date)}
              className={cn(
                "rounded-full py-2 font-sans text-sm transition-colors",
                value?.toDateString() === date.toDateString()
                  ? "bg-vh-brand-gold text-[#323232]"
                  : "text-[#323232] hover:bg-[#f5f5f5]"
              )}
            >
              {date.getDate()}
            </button>
          ) : (
            <span key={`empty-${index}`} />
          )
        )}
      </div>

      {onConfirm ? (
        <Button
          type="button"
          variant="brand-solid"
          className="mt-2 h-11 w-full text-base"
          onClick={onConfirm}
        >
          {confirmLabel}
        </Button>
      ) : null}
    </div>
  );
}
