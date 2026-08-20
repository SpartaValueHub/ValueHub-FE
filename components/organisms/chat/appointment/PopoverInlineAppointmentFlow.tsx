"use client";

import { useState } from "react";
import { CalendarDays, Clock3, MapPin } from "lucide-react";

import { Button } from "@/components/atoms/button";
import { Popover } from "@/components/molecules/Popover";
import { AppointmentFieldRow } from "@/components/molecules/chat/appointment/AppointmentFieldRow";
import { AppointmentMapPreview } from "@/components/molecules/chat/appointment/AppointmentMapPreview";
import { AppointmentNotificationSection } from "@/components/molecules/chat/appointment/AppointmentNotificationSection";
import { DatePickerPanel } from "@/components/molecules/chat/appointment/DatePickerPanel";
import { LocationPickerPanel } from "@/components/molecules/chat/appointment/LocationPickerPanel";
import { TimePickerPanel } from "@/components/molecules/chat/appointment/TimePickerPanel";
import { Dialog, DialogContent } from "@/components/molecules/Dialog";
import {
  formatAppointmentDate,
  formatAppointmentTime,
} from "@/lib/chat/appointment-format";
import {
  emptyAppointmentDraft,
  type AppointmentDraft,
} from "@/types/chat/appointment";

interface PopoverInlineAppointmentFlowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** B안 — 날짜·시간 Popover + 장소 인라인 펼침 (모달 1개 유지) */
export function PopoverInlineAppointmentFlow({
  open,
  onOpenChange,
}: PopoverInlineAppointmentFlowProps) {
  const [draft, setDraft] = useState<AppointmentDraft>(emptyAppointmentDraft);
  const [dateOpen, setDateOpen] = useState(false);
  const [timeOpen, setTimeOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);

  function closeAll() {
    setDateOpen(false);
    setTimeOpen(false);
    setLocationOpen(false);
    onOpenChange(false);
  }

  function handleSubmit() {
    console.info("[dev] popover-inline appointment submit", draft);
    closeAll();
  }

  const canSubmit = draft.date && draft.time && draft.location;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) closeAll();
        else onOpenChange(next);
      }}
      className="max-w-4xl"
    >
      <DialogContent
        padded={false}
        showClose
        onClose={closeAll}
        className="p-6 md:p-8"
      >
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
            <Popover
              open={dateOpen}
              onOpenChange={(next) => {
                setDateOpen(next);
                if (next) {
                  setTimeOpen(false);
                  setLocationOpen(false);
                }
              }}
              trigger={
                <AppointmentFieldRow
                  icon={CalendarDays}
                  label="날짜"
                  value={formatAppointmentDate(draft.date)}
                  showChevron
                />
              }
            >
              <DatePickerPanel
                value={draft.date}
                onChange={(date) =>
                  setDraft((current) => ({ ...current, date }))
                }
                onConfirm={() => setDateOpen(false)}
              />
            </Popover>

            <Popover
              open={timeOpen}
              onOpenChange={(next) => {
                setTimeOpen(next);
                if (next) {
                  setDateOpen(false);
                  setLocationOpen(false);
                }
              }}
              contentClassName="w-[min(100%,360px)]"
              trigger={
                <AppointmentFieldRow
                  icon={Clock3}
                  label="시간"
                  value={formatAppointmentTime(draft.time)}
                  showChevron
                />
              }
            >
              <TimePickerPanel
                value={draft.time}
                onChange={(time) =>
                  setDraft((current) => ({ ...current, time }))
                }
                onConfirm={() => setTimeOpen(false)}
              />
            </Popover>

            <AppointmentFieldRow
              icon={MapPin}
              label="장소"
              value={draft.location?.label ?? "장소를 선택해주세요"}
              onClick={() => {
                setLocationOpen((current) => !current);
                setDateOpen(false);
                setTimeOpen(false);
              }}
            />

            {locationOpen ? (
              <div className="mt-2 rounded-sm border border-[#e8e8e8] bg-[#fafafa] p-4">
                <LocationPickerPanel
                  value={draft.location}
                  onChange={(location) =>
                    setDraft((current) => ({ ...current, location }))
                  }
                  onConfirm={() => setLocationOpen(false)}
                />
              </div>
            ) : null}
          </div>

          {!locationOpen ? (
            <AppointmentMapPreview
              label={draft.location?.label ?? "지도"}
              className="shrink-0"
            />
          ) : null}
        </div>

        <AppointmentNotificationSection
          enabled={draft.notificationEnabled}
          minutes={draft.notificationMinutes}
          onEnabledChange={(notificationEnabled) =>
            setDraft((current) => ({ ...current, notificationEnabled }))
          }
          onMinutesChange={(notificationMinutes) =>
            setDraft((current) => ({ ...current, notificationMinutes }))
          }
        />

        <Button
          type="button"
          variant="brand-solid"
          className="mt-6 h-12 w-full text-base"
          disabled={!canSubmit}
          onClick={handleSubmit}
        >
          예약하기
        </Button>
      </DialogContent>
    </Dialog>
  );
}
