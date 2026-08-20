"use client";

import { Button } from "@/components/atoms/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/molecules/Dialog";
import { cn } from "@/lib/utils";

interface AlertDialogProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  children: React.ReactNode;
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  primaryFilled?: boolean;
  dismissible?: boolean;
  showClose?: boolean;
  primaryPending?: boolean;
  className?: string;
}

/** Figma 알림 모달 — 닫기 + 본문 + 1~2개 모달 버튼 */
export function AlertDialog({
  open,
  onOpenChange,
  title,
  children,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  primaryFilled = false,
  dismissible = true,
  showClose = true,
  primaryPending = false,
  className,
}: AlertDialogProps) {
  const showSecondary = Boolean(secondaryLabel && onSecondary);

  function close() {
    onOpenChange?.(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      dismissible={dismissible}
      className={className}
    >
      <DialogContent
        showClose={showClose}
        onClose={dismissible || onSecondary ? (onSecondary ?? close) : close}
      >
        <DialogHeader>
          {title ? <DialogTitle>{title}</DialogTitle> : null}
          {typeof children === "string" ? (
            <DialogDescription>{children}</DialogDescription>
          ) : (
            children
          )}
        </DialogHeader>
        <DialogFooter className={cn(!showSecondary && "py-[30px]")}>
          {showSecondary ? (
            <Button
              type="button"
              variant="modal"
              size="modal"
              className="min-w-0 flex-1"
              disabled={primaryPending}
              onClick={onSecondary}
            >
              {secondaryLabel}
            </Button>
          ) : null}
          <Button
            type="button"
            variant={primaryFilled ? "modal-filled" : "modal"}
            size="modal"
            className="min-w-0 flex-1"
            disabled={primaryPending}
            aria-busy={primaryPending}
            onClick={onPrimary}
          >
            {primaryLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
