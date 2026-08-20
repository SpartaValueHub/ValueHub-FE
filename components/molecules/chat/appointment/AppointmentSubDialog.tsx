"use client";

import { useEffect } from "react";

import { DialogCloseButton } from "@/components/molecules/Dialog";
import { cn } from "@/lib/utils";

interface AppointmentSubDialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  wide?: boolean;
}

/** stacked 방식 — 메인 Dialog 위에 올리는 서브 모달 */
export function AppointmentSubDialog({
  open,
  onClose,
  title,
  children,
  className,
  wide = false,
}: AppointmentSubDialogProps) {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4"
      onPointerDown={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative max-h-[90vh] overflow-y-auto rounded-[10px] bg-white pt-[50px] shadow-vh",
          wide
            ? "w-full max-w-2xl px-6 pb-6"
            : "w-full max-w-md px-8 pb-6 sm:px-[70px]",
          className
        )}
        onPointerDown={(event) => event.stopPropagation()}
      >
        <DialogCloseButton onClose={onClose} />
        {title ? (
          <h3 className="mb-5 font-sans text-base font-normal text-[#323232]">
            {title}
          </h3>
        ) : null}
        {children}
      </div>
    </div>
  );
}
