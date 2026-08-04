import { BrandHeading, BodyText } from "@/components/atoms/typography";
import { BrandLogoIcon } from "@/components/molecules/BrandLogoIcon";
import { MAIN_SLOGAN } from "@/constants/main-page";
import { cn } from "@/lib/utils";

type BrandLogoSize = "md" | "lg";
type BrandLogoLayout = "stacked" | "inline";

interface BrandLogoProps {
  className?: string;
  heading?: string;
  subtitle?: string;
  showSubtitle?: boolean;
  size?: BrandLogoSize;
  layout?: BrandLogoLayout;
}

const headingSizeClass: Record<BrandLogoSize, string> = {
  md: "text-vh-xl md:text-vh-2xl",
  lg: "text-[2.25rem] md:text-[2.5rem]",
};

/** Value Hub 로고 — PNG 에셋 + 타이틀 (중앙 정렬) */
export function BrandLogo({
  className,
  heading = "Value hub",
  subtitle = MAIN_SLOGAN,
  showSubtitle = true,
  size = "lg",
  layout = "stacked",
}: BrandLogoProps) {
  const headingClassName = cn(
    "!font-normal normal-case tracking-tight text-vh-brand-gold",
    headingSizeClass[size]
  );

  if (layout === "inline") {
    return (
      <div
        className={cn(
          "flex w-full flex-col items-center gap-3 text-center",
          className
        )}
      >
        <div className="flex flex-nowrap items-center justify-center gap-3 md:gap-4">
          <BrandLogoIcon size={size} />
          <BrandHeading size="2xl" className={headingClassName}>
            {heading}
          </BrandHeading>
        </div>

        {showSubtitle && subtitle ? (
          <BodyText
            size="sm"
            className="font-sans font-normal text-vh-brand-gold/90 md:text-vh-base"
          >
            {subtitle}
          </BodyText>
        ) : null}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex w-full flex-col items-center gap-4 text-center md:gap-5",
        className
      )}
    >
      <BrandLogoIcon size={size} />
      <BrandHeading size="2xl" className={headingClassName}>
        {heading}
      </BrandHeading>

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
