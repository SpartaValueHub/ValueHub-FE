"use client";

import { useEffect } from "react";

import { Button } from "@/components/atoms/button";
import { cn } from "@/lib/utils";

export type ConfirmModalProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  /** false — backdrop·ESC·닫기 버튼 비활성 (blocking modal) */
  dismissible?: boolean;
  confirmPending?: boolean;
  className?: string;
};

/**
 * 단일 확인 버튼 모달 — 닉네임 중복확인 등 공통 알림용.
 * dismissible=false 시 backdrop 클릭·ESC로 닫히지 않음.
 */
export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel,
  onConfirm,
  dismissible = true,
  confirmPending = false,
  className,
}: ConfirmModalProps) {
  useEffect(() => {
    if (!open || dismissible) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [open, dismissible]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
      aria-hidden={false}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        aria-describedby="confirm-modal-message"
        className={cn(
          "w-full max-w-sm bg-white px-8 py-10 text-center shadow-xl",
          className
        )}
        onPointerDown={(event) => event.stopPropagation()}
      >
        <h2
          id="confirm-modal-title"
          className="text-lg font-semibold text-vh-gray-900"
        >
          {title}
        </h2>
        <p
          id="confirm-modal-message"
          className="mt-4 whitespace-pre-line text-sm leading-relaxed text-vh-gray-700"
        >
          {message}
        </p>
        <Button
          type="button"
          variant="brand-solid"
          className="mt-8 w-full"
          disabled={confirmPending}
          aria-busy={confirmPending}
          onClick={onConfirm}
        >
          {confirmLabel}
        </Button>
      </div>
    </div>
  );
}
