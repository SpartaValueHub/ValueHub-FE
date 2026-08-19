import { cn } from "@/lib/utils";

interface SiteHeaderLogoProps {
  className?: string;
}

/** 시안 워드마크 — serif + 포인트골드 */
export function SiteHeaderLogo({ className }: SiteHeaderLogoProps) {
  return (
    <span
      className={cn(
        "font-serif text-[1.6rem] leading-none tracking-tight text-[#F2CA7B] md:text-[1.8rem]",
        className
      )}
    >
      Value hub
    </span>
  );
}
