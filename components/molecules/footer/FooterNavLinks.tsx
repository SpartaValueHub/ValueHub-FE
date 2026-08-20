import Link from "next/link";

import { MAIN_FOOTER_LINKS } from "@/constants/main-page";
import { cn } from "@/lib/utils";

interface FooterNavLinksProps {
  className?: string;
  layout?: "row" | "stack";
}

export function FooterNavLinks({
  className,
  layout = "row",
}: FooterNavLinksProps) {
  return (
    <nav
      aria-label="푸터 메뉴"
      className={cn(
        "flex font-sans text-[#868686]",
        layout === "row"
          ? "flex-wrap justify-end gap-[30px] text-lg font-medium"
          : "flex-wrap gap-7 text-[13px]",
        className
      )}
    >
      {MAIN_FOOTER_LINKS.map((link) => (
        <Link
          key={link.label}
          href={link.href}
          className={cn(
            "transition-colors hover:text-vh-gray-500",
            link.label === "광고문의" &&
              layout === "row" &&
              "font-medium text-white/60"
          )}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
