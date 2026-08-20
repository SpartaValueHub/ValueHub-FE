"use client";

import { useEffect, useId, useRef } from "react";

import { Button } from "@/components/atoms/button";
import { Spinner } from "@/components/atoms/spinner";
import {
  Dialog,
  DialogCloseButton,
  DialogTitle,
} from "@/components/molecules/Dialog";
import { cn } from "@/lib/utils";

export type TermDetailSection = {
  title: string;
  content: string;
};

export type TermDetailModalProps = {
  open: boolean;
  title: string;
  sections: TermDetailSection[];
  isLoading?: boolean;
  error?: string | null;
  confirmLabel?: string;
  onClose: () => void;
  className?: string;
};

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * 약관 본문 모달 — Figma 다이얼로그 크롬 + Esc·포커스 트랩.
 */
export function TermDetailModal({
  open,
  title,
  sections,
  isLoading = false,
  error = null,
  confirmLabel = "확인",
  onClose,
  className,
}: TermDetailModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    triggerRef.current = document.activeElement as HTMLElement | null;
    const timer = window.setTimeout(() => {
      const confirmButton =
        dialogRef.current?.querySelector<HTMLButtonElement>("button");
      confirmButton?.focus();
    }, 0);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) {
        return;
      }

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
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", handleKeyDown, true);
      triggerRef.current?.focus();
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => !next && onClose()}
      className={cn("max-w-lg", className)}
    >
      <div
        ref={dialogRef}
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="relative flex max-h-[min(80vh,640px)] flex-col overflow-hidden rounded-[10px] bg-white text-[#323232] shadow-vh"
      >
        <DialogCloseButton onClose={onClose} />
        <div className="px-8 pt-[50px] pb-4 sm:px-[70px]">
          <DialogTitle id={titleId}>{title}</DialogTitle>
        </div>

        <div
          id={descriptionId}
          className="flex-1 overflow-y-auto px-8 py-2 sm:px-[70px]"
        >
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Spinner className="size-6 text-[#868686]" />
            </div>
          ) : error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : sections.length === 0 ? (
            <p className="text-sm text-[#868686]">
              표시할 약관 내용이 없습니다.
            </p>
          ) : (
            <div className="flex flex-col gap-6">
              {sections.map((section) => (
                <section key={section.title}>
                  {sections.length > 1 ? (
                    <h3 className="mb-2 text-sm font-medium text-[#323232]">
                      {section.title}
                    </h3>
                  ) : null}
                  <div className="whitespace-pre-wrap text-sm leading-relaxed text-[#606060]">
                    {section.content}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>

        <div className="px-8 py-6 sm:px-[70px]">
          <Button
            type="button"
            variant="modal"
            size="modal"
            className="w-full"
            onClick={onClose}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
