"use client";

import { useState } from "react";

import { Button } from "@/components/atoms/button";
import { VhIcon } from "@/components/atoms/vh-icon";
import { Dialog, DialogContent } from "@/components/molecules/overlay/Dialog";
import { cn } from "@/lib/utils";

interface LocationRegisterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 모달 오픈 시 초기 장소명 (변경하기일 때) */
  initialPlaceName?: string;
  onConfirm: (placeName: string) => void;
}

interface LocationRegisterDialogBodyProps {
  initialPlaceName: string;
  onConfirm: (placeName: string) => void;
  onOpenChange: (open: boolean) => void;
}

/**
 * Figma location register (539:1232) — 지도 SDK 연동 전 UI.
 * 맵 영역은 placeholder. 장소명만 확정 가능.
 */
export function LocationRegisterDialog({
  open,
  onOpenChange,
  initialPlaceName = "",
  onConfirm,
}: LocationRegisterDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? (
        <LocationRegisterDialogBody
          key={initialPlaceName}
          initialPlaceName={initialPlaceName}
          onConfirm={onConfirm}
          onOpenChange={onOpenChange}
        />
      ) : null}
    </Dialog>
  );
}

function LocationRegisterDialogBody({
  initialPlaceName,
  onConfirm,
  onOpenChange,
}: LocationRegisterDialogBodyProps) {
  const [draft, setDraft] = useState(initialPlaceName);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleConfirm = () => {
    const trimmed = draft.trim();
    if (!trimmed) {
      setLocalError("장소명을 입력해 주세요.");
      return;
    }
    if (trimmed.length > 100) {
      setLocalError("장소명은 최대 100자까지 가능합니다.");
      return;
    }
    onConfirm(trimmed);
    onOpenChange(false);
  };

  return (
    <DialogContent
      showClose
      onClose={() => onOpenChange(false)}
      className="w-full max-w-[550px] gap-[30px] px-5 pb-0 sm:px-[50px]"
    >
      <div className="flex w-full flex-col gap-1.5 font-sans text-[#323232]">
        <p className="text-xl leading-[1.5]">
          거래를 진행할 장소를 선택해주세요.
        </p>
        <p className="text-base leading-[1.5]">지도를 클릭하여 선택하세요.</p>
      </div>

      {/* 지도 SDK 연동 전 placeholder */}
      <div
        className="relative flex min-h-[240px] w-full max-w-[400px] items-center justify-center self-center bg-[#d9d9d9] sm:min-h-[400px] sm:size-[400px]"
        aria-label="지도 영역 (연동 예정)"
      >
        <div className="absolute inset-0 flex items-center justify-center bg-[#c8c8c8]">
          <p className="px-4 text-center font-sans text-sm text-[#606060]">
            지도는 외부 API 연동 후 표시됩니다
          </p>
        </div>
        <VhIcon
          src="/icons/system/navigation/location.svg"
          width={48}
          height={48}
          className="relative z-[1] drop-shadow-md"
        />
        <div className="absolute bottom-2.5 right-2.5 z-[1] flex flex-col gap-1.5">
          <span className="flex size-9 items-center justify-center rounded-md bg-white shadow-[0_0_5px_rgba(0,0,0,0.25)]">
            <VhIcon
              src="/icons/system/navigation/my-location.svg"
              width={22}
              height={22}
            />
          </span>
          <span className="flex size-9 items-center justify-center rounded-md bg-white shadow-[0_0_5px_rgba(0,0,0,0.25)]">
            <VhIcon
              src="/icons/system/essentials/zoom-in.svg"
              width={22}
              height={22}
            />
          </span>
          <span className="flex size-9 items-center justify-center rounded-md bg-white shadow-[0_0_5px_rgba(0,0,0,0.25)]">
            <VhIcon
              src="/icons/system/essentials/zoom-out.svg"
              width={22}
              height={22}
            />
          </span>
        </div>
      </div>

      <div className="flex w-full flex-col gap-2.5">
        <p className="font-sans text-xl leading-[1.5] text-[#323232]">
          선택한 곳의 장소명을 입력해주세요.
        </p>
        <input
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            setLocalError(null);
          }}
          maxLength={100}
          placeholder="예) 강남역 1번 출구, 교보타워 앞"
          className={cn(
            "w-full border-0 border-b border-[#d0d0d0] bg-transparent px-1 py-2.5 font-sans text-base text-[#323232] outline-none",
            "placeholder:text-[#ababab] focus:border-[#323232]"
          )}
        />
        {localError ? (
          <p className="font-sans text-sm text-red-500" role="alert">
            {localError}
          </p>
        ) : null}
      </div>

      <div className="flex w-full items-center justify-center py-6">
        <Button
          type="button"
          variant="modal"
          size="modal"
          className="w-full"
          onClick={handleConfirm}
        >
          거래 장소 등록
        </Button>
      </div>
    </DialogContent>
  );
}
