import { cn } from "@/lib/utils";

type VerticalDividerSize = "sm" | "md";

interface VerticalDividerProps {
  className?: string;
  size?: VerticalDividerSize;
}

const sizeClass: Record<VerticalDividerSize, string> = {
  sm: "h-3",
  md: "h-4",
};

/** 세로 구분선 — 헤더 auth·푸터 정보 행 공통 */
export function VerticalDivider({
  className,
  size = "sm",
}: VerticalDividerProps) {
  return (
    <span
      aria-hidden
      className={cn("w-px shrink-0 bg-[#868686]", sizeClass[size], className)}
    />
  );
}
