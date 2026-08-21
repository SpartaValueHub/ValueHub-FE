import { BrandHeading, BodyText } from "@/components/atoms/typography";
import { BrandLogoIcon } from "@/components/molecules/brand/BrandLogoIcon";
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
  lg: "text-[2.5rem] md:text-[64px]",
};

const subtitleClassName =
  "m-0 text-center font-sans text-sm font-normal text-vh-brand-gold md:text-xl";

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
      <div className={cn("flex w-full justify-center", className)}>
        <div className="inline-grid grid-cols-[auto_auto] items-center gap-x-4 gap-y-4 md:gap-x-5 md:gap-y-5">
          <BrandLogoIcon size={size} className="row-start-1 self-center" />
          <BrandHeading
            size="2xl"
            className={cn(
              headingClassName,
              "col-start-2 row-start-1 m-0 leading-none"
            )}
          >
            {heading}
          </BrandHeading>

          {showSubtitle && subtitle ? (
            <BodyText
              size="sm"
              className={cn(
                subtitleClassName,
                "col-start-2 row-start-2 justify-self-center"
              )}
            >
              {subtitle}
            </BodyText>
          ) : null}
        </div>
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
        <BodyText size="sm" className={subtitleClassName}>
          {subtitle}
        </BodyText>
      ) : null}
    </div>
  );
}
