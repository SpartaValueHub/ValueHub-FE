import { BrandLogo } from "@/components/molecules/BrandLogo";
import { MAIN_SLOGAN } from "@/constants/main-page";
import { cn } from "@/lib/utils";

interface BrandMarkProps {
  className?: string;
  heading?: string;
  subtitle?: string;
}

/** 메인 — 로고 가로 + 슬로건 (에셋 배치) */
export function BrandMark({
  className,
  heading = "Value hub",
  subtitle = MAIN_SLOGAN,
}: BrandMarkProps) {
  return (
    <BrandLogo
      className={cn(className)}
      heading={heading}
      subtitle={subtitle}
      size="lg"
    />
  );
}
