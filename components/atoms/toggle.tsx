"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

interface ToggleProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  className?: string;
}

/** Figma 토글 — on #efbb55 / off #d9d9d9 */
export function Toggle({
  checked,
  defaultChecked = false,
  onCheckedChange,
  disabled,
  label,
  className,
}: ToggleProps) {
  const [uncontrolled, setUncontrolled] = useState(defaultChecked);
  const isControlled = checked !== undefined;
  const isOn = isControlled ? checked : uncontrolled;

  function handleToggle() {
    if (disabled) return;
    const next = !isOn;
    if (!isControlled) setUncontrolled(next);
    onCheckedChange?.(next);
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isOn}
      aria-label={label}
      disabled={disabled}
      onClick={handleToggle}
      className={cn(
        "inline-flex h-[21px] w-[37px] items-center rounded-[50px] px-[3px] py-1 transition-colors",
        isOn ? "justify-end bg-[#efbb55]" : "justify-start bg-[#d9d9d9]",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
    >
      <span className="size-[15px] rounded-[50px] bg-white" />
    </button>
  );
}
