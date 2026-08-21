"use client";

import { useState } from "react";
import Image from "next/image";

import { Button } from "@/components/atoms/button";
import { Icon } from "@/components/atoms/icons";
import { VhInput } from "@/components/atoms/vh-input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/molecules/overlay/Dialog";
import { CHAT_LOCATION_PIN, CHAT_MAP_PICKER } from "@/constants/chat-page";
import { cn } from "@/lib/utils";

type PinPoint = { x: number; y: number };

interface LocationRegisterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (placeName: string) => void;
  confirmLabel?: string;
}

/** Figma 거래 장소 등록 모달 — 지도는 목업, 이후 Kakao/Naver SDK 연동 자리 */
export function LocationRegisterDialog({
  open,
  onOpenChange,
  onConfirm,
  confirmLabel = "거래 장소 등록",
}: LocationRegisterDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? (
        <LocationRegisterDialogBody
          confirmLabel={confirmLabel}
          onClose={() => onOpenChange(false)}
          onConfirm={onConfirm}
        />
      ) : null}
    </Dialog>
  );
}

function LocationRegisterDialogBody({
  confirmLabel,
  onClose,
  onConfirm,
}: {
  confirmLabel: string;
  onClose: () => void;
  onConfirm: (placeName: string) => void;
}) {
  const [pin, setPin] = useState<PinPoint | null>(null);
  const [placeName, setPlaceName] = useState("");

  function handleMapClick(event: React.MouseEvent<HTMLButtonElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    setPin({
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
    });
  }

  const canSubmit = Boolean(pin && placeName.trim());

  return (
    <DialogContent onClose={onClose} className="px-[50px]">
      <DialogHeader className="px-0 sm:px-0">
        <DialogTitle className="text-xl leading-[1.5]">
          거래를 진행할 장소를 선택해주세요.
        </DialogTitle>
        <DialogDescription className="text-base">
          지도를 클릭하여 선택하세요.
        </DialogDescription>
      </DialogHeader>

      <div className="relative size-[400px] max-w-full overflow-hidden bg-[#d9d9d9]">
        {/* TODO: Kakao/Naver Maps SDK — 현재는 Figma 목업 이미지 */}
        <button
          type="button"
          aria-label="지도에서 장소 선택"
          className="absolute inset-0"
          onClick={handleMapClick}
        >
          <Image
            src={CHAT_MAP_PICKER}
            alt=""
            fill
            sizes="400px"
            className="object-cover"
          />
        </button>
        {pin ? (
          <span
            aria-hidden
            className="pointer-events-none absolute size-[78px] -translate-x-1/2 -translate-y-[85%]"
            style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
          >
            <Image
              src={CHAT_LOCATION_PIN}
              alt=""
              width={78}
              height={76}
              unoptimized
              className="size-full object-contain"
            />
          </span>
        ) : null}
        <div className="pointer-events-none absolute inset-y-2.5 right-2.5 flex flex-col items-end justify-between">
          <span className="flex size-9 items-center justify-center rounded-[6px] bg-white shadow-[0_0_5px_rgba(0,0,0,0.25)]">
            <Icon name="my-location" size={24} />
          </span>
          <div className="flex flex-col gap-1.5">
            <span className="flex size-9 items-center justify-center rounded-[6px] bg-white shadow-[0_0_5px_rgba(0,0,0,0.25)]">
              <Icon name="zoom-in" size={28} />
            </span>
            <span className="flex size-9 items-center justify-center rounded-[6px] bg-white shadow-[0_0_5px_rgba(0,0,0,0.25)]">
              <Icon name="zoom-out" size={28} />
            </span>
          </div>
        </div>
      </div>

      <div className="flex w-full flex-col gap-2.5">
        <p className="font-sans text-xl leading-[1.5] text-[#323232]">
          선택한 곳의 장소명을 입력해주세요.
        </p>
        <VhInput
          value={placeName}
          onChange={(event) => setPlaceName(event.target.value)}
          placeholder="예) 강남역 1번 출구, 교보타워 앞"
          inputState={placeName ? "focus" : "default"}
          className={cn(
            "border-[#d0d0d0] py-2.5 text-[#323232] placeholder:text-[#ababab]"
          )}
        />
      </div>

      <DialogFooter className="px-0 py-6 sm:px-0">
        <Button
          type="button"
          variant="modal"
          size="modal"
          className="min-w-0 flex-1"
          disabled={!canSubmit}
          onClick={() => {
            onConfirm(placeName.trim());
            onClose();
          }}
        >
          {confirmLabel}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
