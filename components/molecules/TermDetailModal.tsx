"use client";

import { useEffect, useId, useRef } from "react";

import { Button } from "@/components/atoms/button";
import { Spinner } from "@/components/atoms/spinner";
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
 * 약관 본문 모달 — Esc·포커스 트랩·닫을 때 트리거로 포커스 복귀.
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
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) {
          event.preventDefault();
        }
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className={cn(
          "flex max-h-[min(80vh,640px)] w-full max-w-lg flex-col bg-vh-gray-900 shadow-xl",
          className
        )}
        onPointerDown={(event) => event.stopPropagation()}
      >
        <div className="border-b border-vh-gray-700/60 px-6 py-4">
          <h2 id={titleId} className="text-lg font-semibold text-vh-gray-100">
            {title}
          </h2>
        </div>

        <div id={descriptionId} className="flex-1 overflow-y-auto px-6 py-4">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Spinner className="size-6 text-vh-gray-500" />
            </div>
          ) : error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : sections.length === 0 ? (
            <p className="text-sm text-vh-gray-500">
              표시할 약관 내용이 없습니다.
            </p>
          ) : (
            <div className="flex flex-col gap-6">
              {sections.map((section) => (
                <section key={section.title}>
                  {sections.length > 1 ? (
                    <h3 className="mb-2 text-sm font-semibold text-vh-gray-100">
                      {section.title}
                    </h3>
                  ) : null}
                  <div className="whitespace-pre-wrap text-sm leading-relaxed text-vh-gray-500">
                    {section.content}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-vh-gray-700/60 px-6 py-4">
          <Button
            type="button"
            variant="brand"
            className="h-12 w-full rounded-sm text-base"
            onClick={onClose}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
