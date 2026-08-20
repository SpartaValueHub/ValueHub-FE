import Link from "next/link";

import { cn } from "@/lib/utils";

type BrandWordmarkSize = "sm" | "md" | "lg";

interface BrandWordmarkProps {
  className?: string;
  size?: BrandWordmarkSize;
  href?: string;
}

const sizeClass: Record<BrandWordmarkSize, string> = {
  sm: "text-xl",
  md: "text-[26px] md:text-4xl",
  lg: "text-4xl",
};

/** Value hub 워드마크 — 헤더·푸터·히어로 공통 */
export function BrandWordmark({
  className,
  size = "md",
  href = "/",
}: BrandWordmarkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "font-serif text-vh-brand-gold",
        sizeClass[size],
        className
      )}
    >
      Value hub
    </Link>
  );
}
