"use client";

import { useState } from "react";

import { Dialog, DialogContent } from "@/components/molecules/Dialog";
import { AppointmentMainForm } from "@/components/molecules/chat/appointment/AppointmentMainForm";
import { AppointmentSubDialog } from "@/components/molecules/chat/appointment/AppointmentSubDialog";
import { DatePickerPanel } from "@/components/molecules/chat/appointment/DatePickerPanel";
import { LocationPickerPanel } from "@/components/molecules/chat/appointment/LocationPickerPanel";
import { TimePickerPanel } from "@/components/molecules/chat/appointment/TimePickerPanel";
import {
  emptyAppointmentDraft,
  type AppointmentDraft,
  type AppointmentStackedPicker,
} from "@/types/chat/appointment";

interface StackedAppointmentFlowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** A안 — 메인 모달 + 날짜/시간/장소 각각 서브 모달 겹침 */
export function StackedAppointmentFlow({
  open,
  onOpenChange,
}: StackedAppointmentFlowProps) {
  const [draft, setDraft] = useState<AppointmentDraft>(emptyAppointmentDraft);
  const [picker, setPicker] = useState<AppointmentStackedPicker>(null);

  function closeAll() {
    setPicker(null);
    onOpenChange(false);
  }

  function handleSubmit() {
    console.info("[dev] stacked appointment submit", draft);
    closeAll();
  }

  return (
    <>
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
          <AppointmentMainForm
            draft={draft}
            onDraftChange={setDraft}
            onPickDate={() => setPicker("date")}
            onPickTime={() => setPicker("time")}
            onPickLocation={() => setPicker("location")}
            onClose={closeAll}
            onSubmit={handleSubmit}
            showClose={false}
          />
        </DialogContent>
      </Dialog>

      <AppointmentSubDialog
        open={picker === "date"}
        onClose={() => setPicker(null)}
        title="날짜 선택"
      >
        <DatePickerPanel
          value={draft.date}
          onChange={(date) => setDraft((current) => ({ ...current, date }))}
          onConfirm={() => setPicker(null)}
        />
      </AppointmentSubDialog>

      <AppointmentSubDialog
        open={picker === "time"}
        onClose={() => setPicker(null)}
        title="시간 선택"
      >
        <TimePickerPanel
          value={draft.time}
          onChange={(time) => setDraft((current) => ({ ...current, time }))}
          onConfirm={() => setPicker(null)}
        />
      </AppointmentSubDialog>

      <AppointmentSubDialog
        open={picker === "location"}
        onClose={() => setPicker(null)}
        wide
      >
        <LocationPickerPanel
          value={draft.location}
          onChange={(location) =>
            setDraft((current) => ({ ...current, location }))
          }
          onConfirm={() => setPicker(null)}
        />
      </AppointmentSubDialog>
    </>
  );
}
