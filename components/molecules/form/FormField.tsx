"use client";

import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: string;
  name: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

/** 라벨 + 컨트롤 슬롯 + 에러 — 로그인·회원가입 폼 공통 */
export function FormField({
  label,
  name,
  error,
  required,
  disabled,
  className,
  children,
}: FormFieldProps) {
  const fieldId = name;

  return (
    <div
      className={cn(
        "flex flex-col gap-2",
        "has-[:focus-visible]:[&>label]:text-vh-gold-500",
        className
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
        {required ? (
          <span className="ml-0.5 text-vh-gold-500" aria-hidden>
            *
          </span>
        ) : null}
      </label>

      <div
        className={cn(
          "flex items-center border-b border-vh-gray-100 transition-colors",
          "focus-within:border-vh-gold-500",
          error && "border-destructive",
          disabled && "border-vh-gray-700"
        )}
      >
        {children}
      </div>

      {error ? (
        <p id={`${fieldId}-error`} className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
