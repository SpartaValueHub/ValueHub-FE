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
        "group flex items-baseline gap-2 px-2 py-1 text-left transition-colors",
        className
      )}
    >
      <span
        className={cn(
          "font-serif text-xl md:text-2xl",
          active
            ? "border-b border-vh-gold-500 pb-0.5 text-vh-gold-500"
            : "text-vh-gray-100 group-hover:text-vh-gold-300"
        )}
      >
        {title}
      </span>
      <span className="font-sans text-xs text-vh-gray-500 md:text-sm">
        {description}
      </span>
    </button>
  );
}
