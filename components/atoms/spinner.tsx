"use client";

import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

const sizeClasses = {
  sm: "size-3.5",
  md: "size-4",
} as const;

type SpinnerProps = {
  size?: keyof typeof sizeClasses;
  label?: string;
  className?: string;
  /** Standalone status (default). Set true inside buttons or other live regions. */
  inline?: boolean;
  "aria-label"?: string;
};

function Spinner({
  size = "md",
  label,
  className,
  inline = false,
  "aria-label": ariaLabel,
}: SpinnerProps) {
  const accessibleLabel = ariaLabel ?? label ?? "로딩 중";

  const content = (
    <>
      {label ? <span>{label}</span> : null}
      <Loader2
        className={cn("animate-spin text-vh-gold-500", sizeClasses[size])}
        aria-hidden={!!label || inline}
        aria-label={!label && inline ? accessibleLabel : undefined}
      />
    </>
  );

  if (inline) {
    return (
      <span className={cn("inline-flex items-center gap-1.5", className)}>
        {content}
      </span>
    );
  }

  return (
    <span
      className={cn("inline-flex items-center gap-2", className)}
      role="status"
      aria-busy="true"
      aria-live="polite"
      aria-label={label ? undefined : accessibleLabel}
    >
      {content}
    </span>
  );
}

export { Spinner };
