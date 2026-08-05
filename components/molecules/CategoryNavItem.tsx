"use client";

import { cn } from "@/lib/utils";

interface CategoryNavItemProps {
  title: string;
  description: string;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

export function CategoryNavItem({
  title,
  description,
  active = false,
  onClick,
  className,
}: CategoryNavItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex shrink-0 flex-col items-stretch py-2 transition-colors",
        className
      )}
    >
      <span className="inline-flex justify-center gap-2 whitespace-nowrap md:items-baseline md:gap-4">
        <span
          className={cn(
            "font-serif text-xl leading-none md:text-[28px]",
            active ? "text-vh-gray-100" : "text-vh-gray-100/85"
          )}
        >
          {title}
        </span>
        <span className="font-sans text-xs leading-none text-vh-gray-500 md:text-base">
          {description}
        </span>
      </span>
      <span
        aria-hidden
        className={cn(
          "mt-4 h-px w-full",
          active
            ? "bg-[linear-gradient(90deg,var(--vh-gold-100)_0%,var(--vh-brand-gold)_42%,var(--vh-gold-500)_100%)]"
            : "bg-[linear-gradient(90deg,var(--vh-gold-900)_0%,var(--vh-gold-700)_50%,var(--vh-gold-900)_100%)]"
        )}
      />
    </button>
  );
}
