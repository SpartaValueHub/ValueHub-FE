"use client";

import * as React from "react";

import { UnderlineInput } from "@/components/atoms/underline-input";
import { cn } from "@/lib/utils";

interface UnderlineFieldProps extends React.ComponentProps<"input"> {
  label: string;
  name: string;
  error?: string;
  inputClassName?: string;
}

/** 밑줄형 인풋 + 라벨 — focus/disabled 시 라벨 색상 연동 */
function UnderlineField({
  label,
  name,
  error,
  id,
  className,
  inputClassName,
  disabled,
  ...props
}: UnderlineFieldProps) {
  const fieldId = id ?? name;

  return (
    <div
      className={cn(
        "flex flex-col gap-1",
        "has-[:focus-visible]:[&>label]:text-vh-gold-500",
        className
      )}
    >
      <label
        htmlFor={fieldId}
        className={cn(
          "text-sm font-medium text-foreground transition-colors",
          disabled && "text-vh-gray-700"
        )}
      >
        {label}
      </label>
      <UnderlineInput
        id={fieldId}
        name={name}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        inputClassName={inputClassName}
        {...props}
      />
      {error ? (
        <p id={`${fieldId}-error`} className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export { UnderlineField };
