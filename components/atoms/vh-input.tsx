"use client";

import { VhIcon } from "@/components/atoms/vh-icon";
import { cn } from "@/lib/utils";

type VhInputState = "default" | "focus" | "disabled";

interface VhInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  inputState?: VhInputState;
  clearable?: boolean;
  onClear?: () => void;
  trailing?: React.ReactNode;
}

const borderClass: Record<VhInputState, string> = {
  default: "border-[#ababab] text-[#ababab]",
  focus: "border-vh-brand-gold text-[#868686]",
  disabled:
    "cursor-not-allowed border-[rgba(134,134,134,0.8)] text-[rgba(134,134,134,0.8)]",
};

/** Figma underline input — bottom border only, optional clear */
export function VhInput({
  className,
  inputState = "default",
  disabled,
  clearable = false,
  onClear,
  trailing,
  value,
  defaultValue,
  onChange,
  ...props
}: VhInputProps) {
  const state = disabled ? "disabled" : inputState;
  const hasValue =
    value !== undefined
      ? String(value).length > 0
      : defaultValue !== undefined
        ? String(defaultValue).length > 0
        : false;
  const showClear = clearable && !disabled && hasValue;
  const showTrailing = Boolean(trailing) && !showClear;

  return (
    <div className="relative flex min-w-0 w-full flex-1 items-center">
      <input
        disabled={disabled}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        className={cn(
          "w-full border-0 border-b bg-transparent px-1 py-2 font-sans text-base outline-none placeholder:text-current",
          "focus:border-vh-brand-gold focus:text-[#868686]",
          (showClear || showTrailing) && "pr-9",
          borderClass[state],
          className
        )}
        {...props}
      />
      {showClear ? (
        <button
          type="button"
          aria-label="입력 지우기"
          onClick={onClear}
          className="absolute right-1 flex size-6 items-center justify-center overflow-clip"
        >
          <VhIcon src="/icons/input-clear.svg" width={24} height={24} />
        </button>
      ) : null}
      {showTrailing ? (
        <span className="absolute right-1 flex items-center">{trailing}</span>
      ) : null}
    </div>
  );
}
