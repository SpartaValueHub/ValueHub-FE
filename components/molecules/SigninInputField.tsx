"use client";

import { Eye, EyeOff, X } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

interface SigninInputFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  type?: "text" | "password";
  autoComplete?: string;
}

/** 로그인용 밑줄 인풋 — clear / 비밀번호 표시 토글 */
export function SigninInputField({
  label,
  name,
  value,
  onChange,
  error,
  disabled,
  type = "text",
  autoComplete,
}: SigninInputFieldProps) {
  const fieldId = name;
  const [showPassword, setShowPassword] = React.useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && !showPassword ? "password" : "text";

  return (
    <div
      className={cn(
        "flex flex-col gap-2",
        "has-[:focus-visible]:[&>label]:text-vh-gold-500"
      )}
    >
      <label
        htmlFor={fieldId}
        className={cn(
          "text-sm font-medium text-vh-gray-500 transition-colors",
          disabled && "text-vh-gray-700"
        )}
      >
        {label}
      </label>
      <div
        className={cn(
          "flex items-center border-b border-vh-gray-100 transition-colors",
          "focus-within:border-vh-gold-500",
          error && "border-destructive",
          disabled && "border-vh-gray-700"
        )}
      >
        <input
          id={fieldId}
          name={name}
          type={inputType}
          value={value}
          autoComplete={autoComplete}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? `${fieldId}-error` : undefined}
          onChange={(event) => onChange(event.target.value)}
          className={cn(
            "h-10 min-w-0 flex-1 bg-transparent py-1 text-base text-vh-gray-100 outline-none",
            "placeholder:text-vh-gray-700 md:text-sm",
            "disabled:cursor-not-allowed disabled:text-vh-gray-700"
          )}
        />
        {!isPassword && value ? (
          <button
            type="button"
            onClick={() => onChange("")}
            disabled={disabled}
            className="shrink-0 p-1 text-vh-gray-500 transition-colors hover:text-vh-gray-100 disabled:opacity-50"
            aria-label={`${label} 지우기`}
          >
            <X className="size-4" aria-hidden />
          </button>
        ) : null}
        {isPassword ? (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            disabled={disabled}
            className="shrink-0 p-1 text-vh-gray-500 transition-colors hover:text-vh-gray-100 disabled:opacity-50"
            aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 표시"}
          >
            {showPassword ? (
              <EyeOff className="size-4" aria-hidden />
            ) : (
              <Eye className="size-4" aria-hidden />
            )}
          </button>
        ) : null}
      </div>
      {error ? (
        <p id={`${fieldId}-error`} className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
