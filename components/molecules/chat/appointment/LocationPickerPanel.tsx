"use client";

import { useState } from "react";

import { Button } from "@/components/atoms/button";
import { AppointmentMapPreview } from "@/components/molecules/chat/appointment/AppointmentMapPreview";
import type { AppointmentLocation } from "@/types/chat/appointment";

interface LocationPickerPanelProps {
  value: AppointmentLocation | null;
  onChange: (location: AppointmentLocation) => void;
  onConfirm?: () => void;
  confirmLabel?: string;
}

export function LocationPickerPanel({
  value,
  onChange,
  onConfirm,
  confirmLabel = "거래 장소 등록",
}: LocationPickerPanelProps) {
  const [placeName, setPlaceName] = useState(value?.placeName ?? "");

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-sans text-base font-medium text-[#323232]">
          거래를 진행할 장소를 선택해주세요.
        </h3>
        <p className="mt-1 font-sans text-sm text-[#868686]">
          지도를 클릭하여 선택하세요.
        </p>
      </div>

      <button
        type="button"
        className="w-full text-left"
        onClick={() =>
          onChange({
            label: "부산역 지하철 1번출구",
            placeName: placeName || "부산역 지하철 1번출구",
          })
        }
      >
        <AppointmentMapPreview large label="지도 (클릭하여 선택)" />
      </button>

      <label className="flex flex-col gap-2 font-sans text-sm text-[#323232]">
        선택한 곳의 장소명을 입력해주세요.
        <input
          value={placeName}
          onChange={(event) => setPlaceName(event.target.value)}
          placeholder="예) 강남역 1번 출구, 교보타워 앞"
          className="h-11 rounded-sm border border-[#d9d9d9] px-3 text-sm outline-none focus:border-vh-brand-gold"
        />
      </label>

      <Button
        type="button"
        variant="brand-solid"
        className="h-11 w-full text-base"
        onClick={() => {
          onChange({
            label: placeName || "부산역 지하철 1번출구",
            placeName: placeName || "부산역 지하철 1번출구",
          });
          onConfirm?.();
        }}
      >
        {confirmLabel}
      </Button>
    </div>
  );
}
