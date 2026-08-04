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
        "group inline-flex shrink-0 px-1 py-2 transition-colors",
        className
      )}
    >
      <span
        className={cn(
          "inline-flex items-baseline gap-1.5 whitespace-nowrap border-b pb-0.5 md:gap-2",
          active
            ? "border-vh-brand-gold"
            : "border-vh-gray-500/50 group-hover:border-vh-brand-gold"
        )}
      >
        <span
          className={cn(
            "font-serif text-xl leading-none md:text-2xl",
            active
              ? "text-vh-brand-gold"
              : "text-vh-gray-100 group-hover:text-vh-brand-gold"
          )}
        >
          {title}
        </span>
        <span
          className={cn(
            "font-sans text-xs leading-none md:text-sm",
            active ? "text-vh-brand-gold/80" : "text-vh-gray-100/70"
          )}
        >
          {description}
        </span>
      </span>
    </button>
  );
}
