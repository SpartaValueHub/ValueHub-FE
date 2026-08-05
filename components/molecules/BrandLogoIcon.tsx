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

/** 원본 비율을 보존한 Value Hub V 엠블럼 */
export function BrandLogoIcon({ size = "lg", className }: BrandLogoIconProps) {
  return (
    <div
      aria-hidden
      className={cn("relative shrink-0", iconSizeClass[size], className)}
    >
      <svg viewBox="14 14 92 94" className="size-full" focusable="false">
        <circle cx="60" cy="60" r="45" fill="var(--vh-brand-gold)" />
        <path
          fill="var(--vh-surface-charcoal)"
          d="M15 25h36v9H43l19 55 19-55H70v-9h34L65 106H54L15 25Z"
        />
      </svg>
    </div>
  );
}
