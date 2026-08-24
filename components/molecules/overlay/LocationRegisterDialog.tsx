"use client";

import { useState } from "react";

import { Button } from "@/components/atoms/button";
import { VhInput } from "@/components/atoms/vh-input";
import { KakaoMapPicker } from "@/components/molecules/maps/KakaoMapPicker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/molecules/overlay/Dialog";
import { hasKakaoMapAppKey } from "@/lib/kakao-maps";
import type { UiLocationSelection } from "@/lib/kakao-maps";
import { cn } from "@/lib/utils";

interface LocationRegisterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 모달 오픈 시 초기 장소명 */
  initialPlaceName?: string;
  initialLatitude?: number | null;
  initialLongitude?: number | null;
  /** 확정 시 placeName + 위도·경도 (상품·채팅·예약 공통) */
  onConfirm: (selection: UiLocationSelection) => void;
  confirmLabel?: string;
}

/**
 * 공통 거래/약속 장소 등록 모달 — 카카오맵 픽커.
 * @see docs/kakao-map-setup.md
 */
export function LocationRegisterDialog({
  open,
  onOpenChange,
  initialPlaceName = "",
  initialLatitude = null,
  initialLongitude = null,
  onConfirm,
  confirmLabel = "거래 장소 등록",
}: LocationRegisterDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? (
        <LocationRegisterDialogBody
          key={`${initialPlaceName}-${initialLatitude}-${initialLongitude}`}
          confirmLabel={confirmLabel}
          initialPlaceName={initialPlaceName}
          initialLatitude={initialLatitude}
          initialLongitude={initialLongitude}
          onClose={() => onOpenChange(false)}
          onConfirm={onConfirm}
        />
      ) : null}
    </Dialog>
  );
}

function LocationRegisterDialogBody({
  confirmLabel,
  initialPlaceName,
  initialLatitude,
  initialLongitude,
  onClose,
  onConfirm,
}: {
  confirmLabel: string;
  initialPlaceName: string;
  initialLatitude: number | null;
  initialLongitude: number | null;
  onClose: () => void;
  onConfirm: (selection: UiLocationSelection) => void;
}) {
  const [placeName, setPlaceName] = useState(initialPlaceName);
  const [latitude, setLatitude] = useState<number | null>(
    initialLatitude != null && Number.isFinite(initialLatitude)
      ? initialLatitude
      : null
  );
  const [longitude, setLongitude] = useState<number | null>(
    initialLongitude != null && Number.isFinite(initialLongitude)
      ? initialLongitude
      : null
  );
  const [localError, setLocalError] = useState<string | null>(null);

  const keyReady = hasKakaoMapAppKey();
  const canSubmit =
    keyReady &&
    latitude != null &&
    longitude != null &&
    Boolean(placeName.trim()) &&
    placeName.trim().length <= 100;

  const handleConfirm = () => {
    const trimmed = placeName.trim();
    if (!keyReady) {
      setLocalError("카카오맵 키를 설정한 뒤 다시 시도해 주세요.");
      return;
    }
    if (latitude == null || longitude == null) {
      setLocalError("지도에서 장소를 선택해 주세요.");
      return;
    }
    if (!trimmed) {
      setLocalError("장소명을 입력해 주세요.");
      return;
    }
    if (trimmed.length > 100) {
      setLocalError("장소명은 최대 100자까지 가능합니다.");
      return;
    }
    onConfirm({
      placeName: trimmed,
      latitude,
      longitude,
    });
    onClose();
  };

  return (
    <DialogContent
      showClose
      onClose={onClose}
      className="w-full max-w-[550px] gap-[30px] px-5 pb-0 sm:px-[50px]"
    >
      <DialogHeader className="px-0 sm:px-0">
        <DialogTitle className="text-xl leading-[1.5] text-[#323232]">
          거래를 진행할 장소를 선택해주세요.
        </DialogTitle>
        <DialogDescription className="text-base text-[#323232]">
          지도를 클릭하여 선택하세요.
        </DialogDescription>
      </DialogHeader>

      <div className="flex w-full justify-center">
        <KakaoMapPicker
          initialLatitude={initialLatitude}
          initialLongitude={initialLongitude}
          onPick={({ latitude: lat, longitude: lng, suggestedPlaceName }) => {
            setLatitude(lat);
            setLongitude(lng);
            setLocalError(null);
            // 장소 변경(수정) 시에도 픽한 좌표의 역지오코딩명을 반영
            if (suggestedPlaceName) {
              setPlaceName(suggestedPlaceName);
            }
          }}
        />
      </div>

      <div className="flex w-full flex-col gap-2.5">
        <p className="font-sans text-xl leading-[1.5] text-[#323232]">
          선택한 곳의 장소명을 입력해주세요.
        </p>
        <VhInput
          value={placeName}
          onChange={(event) => {
            setPlaceName(event.target.value);
            setLocalError(null);
          }}
          placeholder="예) 강남역 1번 출구, 교보타워 앞"
          inputState={placeName ? "focus" : "default"}
          className={cn(
            "border-[#d0d0d0] py-2.5 text-[#323232] placeholder:text-[#ababab]"
          )}
        />
        {localError ? (
          <p className="font-sans text-sm text-[#ff5d31]" role="alert">
            {localError}
          </p>
        ) : null}
      </div>

      <DialogFooter className="px-0 py-6 sm:px-0">
        <Button
          type="button"
          variant="modal"
          size="modal"
          className="min-w-0 flex-1"
          disabled={!canSubmit}
          onClick={handleConfirm}
        >
          {confirmLabel}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
