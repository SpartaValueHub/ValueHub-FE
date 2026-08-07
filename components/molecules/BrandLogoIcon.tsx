import Image from "next/image";

import { cn } from "@/lib/utils";

type BrandLogoIconSize = "md" | "lg";

const iconSizeClass: Record<BrandLogoIconSize, string> = {
  md: "size-12",
  lg: "size-16 md:size-[72px]",
};

interface BrandLogoIconProps {
  size?: BrandLogoIconSize;
  className?: string;
}

/** Value Hub 원형 V 엠블럼 (PNG) */
export function BrandLogoIcon({ size = "lg", className }: BrandLogoIconProps) {
  return (
    <Image
      src="/brand/logo.png"
      alt=""
      aria-hidden
      width={72}
      height={72}
      className={cn(
        "relative shrink-0 object-contain",
        iconSizeClass[size],
        className
      )}
    />
  );
}
