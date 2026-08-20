"use client";

import { CalendarDays, Clock3, MapPin, X } from "lucide-react";

import { Button } from "@/components/atoms/button";
import { AppointmentFieldRow } from "@/components/molecules/chat/appointment/AppointmentFieldRow";
import { AppointmentMapPreview } from "@/components/molecules/chat/appointment/AppointmentMapPreview";
import { AppointmentNotificationSection } from "@/components/molecules/chat/appointment/AppointmentNotificationSection";
import {
  formatAppointmentDate,
  formatAppointmentTime,
} from "@/lib/chat/appointment-format";
import type { AppointmentDraft } from "@/types/chat/appointment";

interface AppointmentMainFormProps {
  draft: AppointmentDraft;
  onDraftChange: (draft: AppointmentDraft) => void;
  onPickDate: () => void;
  onPickTime: () => void;
  onPickLocation: () => void;
  onClose: () => void;
  onSubmit: () => void;
  showClose?: boolean;
}

export function AppointmentMainForm({
  draft,
  onDraftChange,
  onPickDate,
  onPickTime,
  onPickLocation,
  onClose,
  onSubmit,
  showClose = true,
}: AppointmentMainFormProps) {
  const canSubmit = draft.date && draft.time && draft.location;

  return (
    <div className="relative bg-white">
      {showClose ? (
        <button
          type="button"
          aria-label="닫기"
          onClick={onClose}
          className="absolute top-0 right-0 text-[#868686] hover:text-[#323232]"
        >
          <X className="size-5" />
        </button>
      ) : null}

      <div className="pr-8">
        <h2 className="font-sans text-xl font-medium text-[#323232]">
          거래 예약하기
        </h2>
        <p className="mt-1 font-sans text-sm text-[#868686]">
          거래 날짜, 시간, 장소를 설정하세요.
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-6 lg:flex-row">
        <div className="min-w-0 flex-1">
          <AppointmentFieldRow
            icon={CalendarDays}
            label="날짜"
            value={formatAppointmentDate(draft.date)}
            onClick={onPickDate}
          />
          <AppointmentFieldRow
            icon={Clock3}
            label="시간"
            value={formatAppointmentTime(draft.time)}
            onClick={onPickTime}
          />
          <AppointmentFieldRow
            icon={MapPin}
            label="장소"
            value={draft.location?.label ?? "장소를 선택해주세요"}
            onClick={onPickLocation}
          />
        </div>

        <AppointmentMapPreview
          label={draft.location?.label ?? "지도"}
          className="shrink-0"
        />
      </div>

      <AppointmentNotificationSection
        enabled={draft.notificationEnabled}
        minutes={draft.notificationMinutes}
        onEnabledChange={(notificationEnabled) =>
          onDraftChange({ ...draft, notificationEnabled })
        }
        onMinutesChange={(notificationMinutes) =>
          onDraftChange({ ...draft, notificationMinutes })
        }
      />

      <Button
        type="button"
        variant="brand-solid"
        className="mt-6 h-12 w-full text-base"
        disabled={!canSubmit}
        onClick={onSubmit}
      >
        예약하기
      </Button>
    </div>
  );
}
