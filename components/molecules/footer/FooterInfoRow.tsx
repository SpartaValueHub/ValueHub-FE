import { VerticalDivider } from "@/components/atoms/vertical-divider";
import { cn } from "@/lib/utils";

interface FooterInfoRowProps {
  items: React.ReactNode[];
  className?: string;
  textClassName?: string;
}

/** 푸터 정보 행 — `|` 구분선 공통 */
export function FooterInfoRow({
  items,
  className,
  textClassName = "font-sans text-xs text-[#868686] md:text-base",
}: FooterInfoRowProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3.5",
        textClassName,
        className
      )}
    >
      {items.map((item, index) => (
        <span key={index} className="inline-flex items-center gap-3.5">
          {index > 0 ? <VerticalDivider /> : null}
          {item}
        </span>
      ))}
    </div>
  );
}
