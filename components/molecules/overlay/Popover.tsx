"use client";

import { useEffect, useId, useRef } from "react";

import { cn } from "@/lib/utils";

interface PopoverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

/** 필드 버튼 아래에 뜨는 lightweight Popover */
export function Popover({
  open,
  onOpenChange,
  trigger,
  children,
  className,
  contentClassName,
}: PopoverProps) {
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        onOpenChange(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onOpenChange(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onOpenChange]);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <div
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        onClick={() => onOpenChange(!open)}
      >
        {trigger}
      </div>

      {open ? (
        <div
          id={id}
          role="dialog"
          className={cn(
            "absolute top-full left-0 z-20 mt-2 w-[min(100%,320px)] rounded-sm border border-[#e8e8e8] bg-white p-4 shadow-vh",
            contentClassName
          )}
          onPointerDown={(event) => event.stopPropagation()}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}
