"use client";

import { Button } from "@/components/atoms/button";
import { cn } from "@/lib/utils";

interface SignupFieldWithActionProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
  actionLabel: string;
  onAction?: () => void;
  actionDisabled?: boolean;
  actionMessage?: string;
  actionTone?: "default" | "success" | "error";
  disabled?: boolean;
  required?: boolean;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
  actionPending?: boolean;
  inputMode?:
    | "none"
    | "text"
    | "tel"
    | "url"
    | "email"
    | "numeric"
    | "decimal"
    | "search";
}

/** 밑줄 인풋 + 우측 액션 버튼 (중복확인·주소검색 등) */
export function SignupFieldWithAction({
  label,
  name,
  value,
  onChange,
  error,
  hint,
  actionLabel,
  onAction,
  actionDisabled,
  actionMessage,
  actionTone = "default",
  disabled,
  required,
  type = "text",
  autoComplete,
  placeholder,
  actionPending,
  inputMode,
}: SignupFieldWithActionProps) {
  const fieldId = name;

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={fieldId}
        className={cn(
          "text-sm font-medium text-vh-gray-500",
          disabled && "text-vh-gray-700"
        )}
      >
        {label}
        {required ? (
          <span className="ml-0.5 text-vh-gold-500" aria-hidden>
            *
          </span>
        ) : null}
      </label>
      <div
        className={cn(
          "flex items-end gap-3 border-b border-vh-gray-100 transition-colors",
          "focus-within:border-vh-gold-500",
          error && "border-destructive",
          disabled && "border-vh-gray-700"
        )}
      >
        <input
          id={fieldId}
          name={name}
          type={type}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          inputMode={inputMode}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={
            error || hint || actionMessage ? `${fieldId}-desc` : undefined
          }
          onChange={(event) => onChange(event.target.value)}
          className={cn(
            "h-10 min-w-0 flex-1 bg-transparent py-1 text-base text-vh-gray-100 outline-none",
            "placeholder:text-vh-gray-700 md:text-sm",
            "disabled:cursor-not-allowed disabled:text-vh-gray-700"
          )}
        />
        <Button
          type="button"
          variant="brand"
          size="sm"
          className="mb-1 shrink-0 rounded-sm px-3 py-1 text-xs"
          disabled={disabled || actionDisabled || actionPending}
          onClick={onAction}
        >
          {actionPending ? "확인 중..." : actionLabel}
        </Button>
      </div>
      {error ? (
        <p id={`${fieldId}-desc`} className="text-sm text-destructive">
          {error}
        </p>
      ) : actionMessage ? (
        <p
          id={`${fieldId}-desc`}
          className={cn(
            "text-xs",
            actionTone === "success" && "text-vh-gold-500",
            actionTone === "error" && "text-destructive",
            actionTone === "default" && "text-vh-gray-500"
          )}
        >
          {actionMessage}
        </p>
      ) : hint ? (
        <p id={`${fieldId}-desc`} className="text-xs text-vh-gray-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
