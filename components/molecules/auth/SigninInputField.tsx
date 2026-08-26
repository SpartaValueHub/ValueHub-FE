"use client";

import { Eye, EyeOff, X } from "lucide-react";
import * as React from "react";

import { FormField } from "@/components/molecules/form/FormField";
import { cn } from "@/lib/utils";

interface SigninInputFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  type?: "text" | "password";
  autoComplete?: string;
  placeholder?: string;
  hideLabelOnMobile?: boolean;
}

/** 로그인용 밑줄 인풋 — clear / 비밀번호 표시 토글 */
export function SigninInputField({
  label,
  name,
  value,
  onChange,
  error,
  disabled,
  required,
  type = "text",
  autoComplete,
  placeholder,
  hideLabelOnMobile = false,
}: SigninInputFieldProps) {
  const fieldId = name;
  const [showPassword, setShowPassword] = React.useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && !showPassword ? "password" : "text";
  const mobilePlaceholder = hideLabelOnMobile
    ? (placeholder ?? label)
    : placeholder;

  return (
    <FormField
      label={label}
      name={name}
      error={error}
      required={required}
      disabled={disabled}
      className={cn(
        hideLabelOnMobile &&
          "[&>label]:sr-only md:[&>label]:not-sr-only [&>div]:px-1 [&>div]:border-[#d0d0d0] md:[&>div]:border-vh-gray-100 md:[&>div]:px-0"
      )}
    >
      <input
        id={fieldId}
        name={name}
        type={inputType}
        value={value}
        placeholder={mobilePlaceholder}
        autoComplete={autoComplete}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          "h-10 min-w-0 flex-1 bg-transparent py-1 text-base text-vh-gray-100 outline-none",
          "placeholder:text-[#868686] md:text-sm",
          hideLabelOnMobile && "md:placeholder:opacity-0",
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
          <X className="size-5 md:size-4" aria-hidden />
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
            <Eye className="size-5 md:size-6" aria-hidden />
          ) : (
            <EyeOff className="size-5 md:size-6" aria-hidden />
          )}
        </button>
      ) : null}
    </FormField>
  );
}
