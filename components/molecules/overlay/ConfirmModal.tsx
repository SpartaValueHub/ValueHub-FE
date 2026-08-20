"use client";

import { AlertDialog } from "@/components/molecules/overlay/AlertDialog";

export type ConfirmModalProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  cancelLabel?: string;
  onCancel?: () => void;
  /** false — backdrop·ESC 비활성 (blocking modal) */
  dismissible?: boolean;
  confirmPending?: boolean;
  confirmFilled?: boolean;
  className?: string;
};

/**
 * 확인 모달 — Figma 알림 다이얼로그 스타일.
 * dismissible=false 시 backdrop 클릭·ESC로 닫히지 않음.
 */
export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel,
  onConfirm,
  cancelLabel,
  onCancel,
  dismissible = true,
  confirmPending = false,
  confirmFilled = false,
  className,
}: ConfirmModalProps) {
  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onCancel?.();
      }}
      title={title}
      primaryLabel={confirmLabel}
      onPrimary={onConfirm}
      secondaryLabel={cancelLabel}
      onSecondary={onCancel}
      primaryFilled={confirmFilled}
      dismissible={dismissible}
      primaryPending={confirmPending}
      className={className}
    >
      {message}
    </AlertDialog>
  );
}
