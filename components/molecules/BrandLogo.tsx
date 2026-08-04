import { BrandHeading, BodyText } from "@/components/atoms/typography";
import { BrandLogoIcon } from "@/components/molecules/BrandLogoIcon";
import { MAIN_SLOGAN } from "@/constants/main-page";
import { cn } from "@/lib/utils";

type BrandLogoSize = "md" | "lg";

interface BrandLogoProps {
  className?: string;
  heading?: string;
  subtitle?: string;
  showSubtitle?: boolean;
  size?: BrandLogoSize;
}

const headingSizeClass: Record<BrandLogoSize, string> = {
  md: "text-vh-xl md:text-vh-2xl",
  lg: "text-[1.65rem] md:text-[1.85rem]",
};

/** Value Hub 로고 — PNG 에셋 + 타이틀 (중앙 정렬) */
export function BrandLogo({
  className,
  heading = "Value hub",
  subtitle = MAIN_SLOGAN,
  showSubtitle = true,
  size = "lg",
}: BrandLogoProps) {
  return (
    <div
      className={cn(
        "flex w-full flex-col items-center gap-3 text-center",
        className
      )}
    >
      <div className="flex items-center justify-center gap-3 md:gap-4">
        <BrandLogoIcon size={size} />
        <BrandHeading
          size="2xl"
          className={cn(
            "text-vh-brand-gold font-normal normal-case tracking-tight",
            headingSizeClass[size]
          )}
        >
          {heading}
        </BrandHeading>
      </div>

      {showSubtitle && subtitle ? (
        <BodyText
          size="sm"
          className="text-vh-brand-gold font-sans font-normal md:text-vh-base"
        >
          {subtitle}
        </BodyText>
      ) : null}
    </div>
  );
}
