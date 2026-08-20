import { BrandLogoIcon } from "@/components/molecules/brand/BrandLogoIcon";
import { BrandWordmark } from "@/components/molecules/brand/BrandWordmark";
import { cn } from "@/lib/utils";

interface FooterBrandProps {
  className?: string;
}

/** 푸터 로고 블록 — emblem + wordmark */
export function FooterBrand({ className }: FooterBrandProps) {
  return (
    <div className={cn("flex items-end gap-2.5 opacity-60", className)}>
      <BrandLogoIcon size="md" className="size-[21px] md:size-[42px]" />
      <BrandWordmark size="md" className="pointer-events-none" href="/" />
    </div>
  );
}
