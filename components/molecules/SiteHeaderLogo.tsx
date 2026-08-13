import Image from "next/image";

import { cn } from "@/lib/utils";

type SiteHeaderLogoSize = "md" | "lg";

const sizeClass: Record<SiteHeaderLogoSize, string> = {
  md: "size-9 md:size-10",
  lg: "size-12",
};

interface SiteHeaderLogoProps {
  size?: SiteHeaderLogoSize;
  className?: string;
}

/** Listing SiteHeader 전용 로고 — 메인 BrandLogoIcon과 분리 */
export function SiteHeaderLogo({
  size = "md",
  className,
}: SiteHeaderLogoProps) {
  return (
    <span
      className={cn("relative inline-block shrink-0", sizeClass[size], className)}
    >
      <Image
        src="/brand/logo-mark.png"
        alt="Value Hub"
        fill
        className="object-contain"
        sizes="40px"
        priority
      />
    </span>
  );
}
