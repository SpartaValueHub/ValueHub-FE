import Image from "next/image";

import { cn } from "@/lib/utils";

type BrandLogoIconSize = "md" | "lg";

const iconSizeClass: Record<BrandLogoIconSize, string> = {
  md: "size-14",
  lg: "size-[3.75rem]",
};

interface BrandLogoIconProps {
  size?: BrandLogoIconSize;
  className?: string;
}

/** V 엠블럼 — 제공 PNG 에셋(원 + V) 레이어 */
export function BrandLogoIcon({ size = "lg", className }: BrandLogoIconProps) {
  return (
    <div
      aria-hidden
      className={cn("relative shrink-0", iconSizeClass[size], className)}
    >
      <Image
        src="/brand/logo-circle.png"
        alt=""
        fill
        sizes={size === "lg" ? "60px" : "56px"}
        className="object-contain"
        priority
      />
      <Image
        src="/brand/logo-v.png"
        alt=""
        fill
        sizes={size === "lg" ? "34px" : "32px"}
        className="object-contain p-[22%]"
        priority
      />
    </div>
  );
}
