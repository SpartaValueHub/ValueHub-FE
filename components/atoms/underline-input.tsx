"use client";

import * as React from "react";
import { Input as InputPrimitive } from "@base-ui/react/input";

import { cn } from "@/lib/utils";

export interface UnderlineInputProps extends Omit<
  React.ComponentProps<"input">,
  "size"
> {
  inputClassName?: string;
}

/** 밑줄형 인풋 — focus 시 accent gold, disabled 시 gray */
function UnderlineInput({
  className,
  inputClassName,
  disabled,
  ...props
}: UnderlineInputProps) {
  return (
    <InputPrimitive
      data-slot="underline-input"
      disabled={disabled}
      className={cn(
        "h-9 w-full min-w-0 border-0 border-b border-foreground bg-transparent px-0 py-1 text-base text-foreground transition-colors outline-none",
        "placeholder:text-muted-foreground",
        "focus-visible:border-vh-gold-500 focus-visible:ring-0",
        "disabled:cursor-not-allowed disabled:border-vh-gray-700 disabled:text-vh-gray-700",
        "aria-invalid:border-destructive",
        "md:text-sm",
        className,
        inputClassName
      )}
      {...props}
    />
  );
}

export { UnderlineInput };
