"use client";

import { useEffect, useState } from "react";

import { AlertDialog } from "@/components/molecules/overlay/AlertDialog";
import {
  DialogDescription,
  DialogRemainTime,
} from "@/components/molecules/overlay/Dialog";

interface LoginLimitDialogProps {
  open: boolean;
  initialSeconds?: number;
  onOpenChange?: (open: boolean) => void;
}

/** Figma 로그인 시도 제한 모달 — 남은시간 카운트다운 */
export function LoginLimitDialog({
  open,
  initialSeconds = 120,
  onOpenChange,
}: LoginLimitDialogProps) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const restrictMinutes = Math.max(1, Math.ceil(initialSeconds / 60));

  useEffect(() => {
    if (!open) return;
    const timer = window.setInterval(() => {
      setSeconds((current) => Math.max(current - 1, 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [open]);

  function close() {
    onOpenChange?.(false);
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={onOpenChange}
      primaryLabel="확인"
      onPrimary={close}
      secondaryLabel="취소"
      onSecondary={close}
      primaryFilled
    >
      <div className="flex w-full flex-col items-start gap-[30px]">
        <DialogDescription>
          {`로그인 시도 횟수가 초과되었습니다.
보안을 위해 ${restrictMinutes}분간 로그인 기능이 제한됩니다.
잠시 후 다시 시도해주세요.`}
        </DialogDescription>
        <DialogRemainTime seconds={seconds} />
      </div>
    </AlertDialog>
  );
}
