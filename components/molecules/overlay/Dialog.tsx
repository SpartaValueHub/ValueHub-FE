"use client";

import { useEffect, useId, useRef } from "react";

import { VhIcon } from "@/components/atoms/vh-icon";
import { cn } from "@/lib/utils";

interface DialogProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
  dismissible?: boolean;
  className?: string;
}

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** 모달 루트 — backdrop + 포커스 트랩 */
export function Dialog({
  open,
  onOpenChange,
  children,
  dismissible = true,
  className,
}: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && dismissible) {
        event.preventDefault();
        onOpenChange?.(false);
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      ).filter((element) => element.offsetParent !== null);

      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [open, dismissible, onOpenChange]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
      onPointerDown={() => {
        if (dismissible) onOpenChange?.(false);
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        className={cn("relative w-full max-w-[550px] outline-none", className)}
        onPointerDown={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

interface DialogCloseButtonProps {
  onClose: () => void;
  className?: string;
}

export function DialogCloseButton({
  onClose,
  className,
}: DialogCloseButtonProps) {
  return (
    <button
      type="button"
      aria-label="닫기"
      onClick={onClose}
      className={cn(
        "absolute top-2 right-[9px] flex size-8 items-center justify-center rounded-[6px] text-[#2d3748] transition-colors hover:bg-black/5",
        className
      )}
    >
      <VhIcon
        src="/icons/system/essentials/modal-close.svg"
        width={12}
        height={12}
      />
    </button>
  );
}

interface DialogContentProps extends React.ComponentProps<"div"> {
  showClose?: boolean;
  onClose?: () => void;
  /** Figma 알림 모달 패딩 · 넓은 콘텐츠 모달은 false */
  padded?: boolean;
}

export function DialogContent({
  className,
  showClose = true,
  onClose,
  padded = true,
  children,
  ...props
}: DialogContentProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[10px] bg-white text-[#323232] shadow-vh",
        padded && "flex flex-col items-center gap-[30px] pt-[50px]",
        !padded && "p-6 md:p-8",
        className
      )}
      {...props}
    >
      {showClose && onClose ? <DialogCloseButton onClose={onClose} /> : null}
      {children}
    </div>
  );
}

export function DialogHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex w-full flex-col items-start gap-5 px-8 sm:px-[70px]",
        className
      )}
      {...props}
    />
  );
}

export function DialogTitle({
  className,
  ...props
}: React.ComponentProps<"h2">) {
  const titleId = useId();
  return (
    <h2
      id={titleId}
      className={cn(
        "font-sans text-base font-normal leading-[1.5] text-[#323232]",
        className
      )}
      {...props}
    />
  );
}

export function DialogDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      className={cn(
        "font-sans text-xl font-normal leading-[1.5] whitespace-pre-line text-[#323232]",
        className
      )}
      {...props}
    />
  );
}

export function DialogFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex w-full items-center justify-center gap-[22px] px-8 py-6 sm:px-[70px]",
        className
      )}
      {...props}
    />
  );
}

export function DialogRemainTime({ seconds }: { seconds: number }) {
  const minutes = Math.floor(Math.max(seconds, 0) / 60);
  const rest = Math.max(seconds, 0) % 60;
  const label = `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;

  return (
    <div className="flex items-start gap-2.5 font-sans text-xl leading-[1.5]">
      <span className="text-[#323232]">남은시간</span>
      <span className="text-[#f30]">{label}</span>
    </div>
  );
}

export function DialogMaskedValue({
  prefix,
  value,
  suffix = "입니다.",
}: {
  prefix: string;
  value: string;
  suffix?: string;
}) {
  return (
    <div className="flex flex-col items-start gap-1.5">
      <p className="font-sans text-xl leading-[1.5] text-[#323232]">{prefix}</p>
      <p className="flex items-end gap-1 text-[#323232]">
        <span className="font-sans text-2xl font-medium leading-[1.5]">
          {value}
        </span>
        <span className="font-sans text-xl font-normal leading-[1.5]">
          {suffix}
        </span>
      </p>
    </div>
  );
}
