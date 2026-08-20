"use client";

import { Button } from "@/components/atoms/button";
import {
  APPOINTMENT_HOURS,
  APPOINTMENT_MINUTES,
} from "@/constants/chat-appointment";
import type { AppointmentTime } from "@/types/chat/appointment";

interface TimePickerPanelProps {
  value: AppointmentTime | null;
  onChange: (time: AppointmentTime) => void;
  onConfirm?: () => void;
  confirmLabel?: string;
}

export function TimePickerPanel({
  value,
  onChange,
  onConfirm,
  confirmLabel = "확인",
}: TimePickerPanelProps) {
  const draft = value ?? { period: "PM" as const, hour: 6, minute: 0 };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <label className="flex flex-col gap-2 font-sans text-xs text-[#868686]">
          오전/오후
          <select
            value={draft.period}
            onChange={(event) =>
              onChange({
                ...draft,
                period: event.target.value as AppointmentTime["period"],
              })
            }
            className="h-11 rounded-sm border border-[#d9d9d9] bg-white px-3 text-sm text-[#323232]"
          >
            <option value="AM">오전</option>
            <option value="PM">오후</option>
          </select>
        </label>

        <label className="flex flex-col gap-2 font-sans text-xs text-[#868686]">
          시
          <select
            value={draft.hour}
            onChange={(event) =>
              onChange({ ...draft, hour: Number(event.target.value) })
            }
            className="h-11 rounded-sm border border-[#d9d9d9] bg-white px-3 text-sm text-[#323232]"
          >
            {APPOINTMENT_HOURS.map((hour) => (
              <option key={hour} value={hour}>
                {String(hour).padStart(2, "0")}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2 font-sans text-xs text-[#868686]">
          분
          <select
            value={String(draft.minute).padStart(2, "0")}
            onChange={(event) =>
              onChange({ ...draft, minute: Number(event.target.value) })
            }
            className="h-11 rounded-sm border border-[#d9d9d9] bg-white px-3 text-sm text-[#323232]"
          >
            {APPOINTMENT_MINUTES.map((minute) => (
              <option key={minute} value={minute}>
                {minute}
              </option>
            ))}
          </select>
        </label>
      </div>

      {onConfirm ? (
        <Button
          type="button"
          variant="brand-solid"
          className="h-11 w-full text-base"
          onClick={onConfirm}
        >
          {confirmLabel}
        </Button>
      ) : null}
    </div>
  );
}
