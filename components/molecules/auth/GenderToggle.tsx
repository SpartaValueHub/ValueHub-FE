"use client";

import { cn } from "@/lib/utils";

export type GenderOption = "female" | "male";

interface GenderToggleProps {
  value?: GenderOption;
  onChange?: (value: GenderOption) => void;
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
}

/** 성별 선택 — 본인인증 prefill 후 읽기 전용 */
export function GenderToggle({
  value,
  onChange,
  disabled,
  readOnly,
  className,
}: GenderToggleProps) {
  const isLocked = disabled || readOnly;

  return (
    <div
      className={cn(
        "flex shrink-0 items-center gap-2 text-sm text-vh-gray-500",
        className
      )}
    >
      {(
        [
          { id: "female" as const, label: "여자" },
          { id: "male" as const, label: "남자" },
        ] as const
      ).map((option, index) => (
        <span key={option.id} className="flex items-center gap-2">
          {index > 0 ? (
            <span aria-hidden className="text-vh-gray-700">
              |
            </span>
          ) : null}
          <button
            type="button"
            disabled={isLocked}
            onClick={() => onChange?.(option.id)}
            className={cn(
              "transition-colors",
              value === option.id ? "text-vh-gold-500" : "text-vh-gray-500",
              isLocked && "cursor-default"
            )}
          >
            {option.label}
          </button>
        </span>
      ))}
    </div>
  );
}
