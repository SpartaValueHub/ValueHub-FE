"use client";

import Link from "next/link";

import { MAIN_HEADER_NAV } from "@/constants/main-page";
import { headerCategoryNavHref } from "@/constants/product-posts";
import { cn } from "@/lib/utils";

type HeaderCategoryNavSize = "sm" | "md";

interface HeaderCategoryNavProps {
  activeId?: string;
  className?: string;
  size?: HeaderCategoryNavSize;
  onNavigate?: (id: string) => void;
}

const sizeClass: Record<HeaderCategoryNavSize, string> = {
  sm: "gap-4 text-sm",
  md: "gap-[70px] text-xl",
};

/** 헤더 카테고리 네비 — All 활성 시 그라데이션 텍스트 */
export function HeaderCategoryNav({
  activeId = "all",
  className,
  size = "md",
  onNavigate,
}: HeaderCategoryNavProps) {
  return (
    <nav
      aria-label="상품 카테고리"
      className={cn(
        "flex items-center font-sans font-light text-[#e0e0e0]",
        sizeClass[size],
        className
      )}
    >
      {MAIN_HEADER_NAV.map((item) => {
        const isActive = activeId === item.id;

        return (
          <Link
            key={item.id}
            href={headerCategoryNavHref(item.id)}
            onClick={() => onNavigate?.(item.id)}
            className={cn(
              "shrink-0 transition-colors hover:text-vh-brand-gold",
              isActive && "vh-nav-active"
            )}
          >
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}
