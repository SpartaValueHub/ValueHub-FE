"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { ALL_CATEGORY_NAV_ID } from "@/constants/categories";
import {
  PRODUCT_POSTS_PATH,
  productPostsHref,
} from "@/constants/product-posts";
import { cn } from "@/lib/utils";
import type { UiCategoryNavItem } from "@/types/categories/ui";

interface HeaderCategoryNavProps {
  items: UiCategoryNavItem[];
  className?: string;
}

export function categoryNavHref(item: UiCategoryNavItem) {
  if (item.id === ALL_CATEGORY_NAV_ID) {
    return productPostsHref();
  }
  return productPostsHref(item.categoryUuid ?? item.id);
}

export function HeaderCategoryNav({
  items,
  className,
}: HeaderCategoryNavProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const raw = searchParams.get("category")?.trim();

  /** 홈(/)은 카테고리 진입 전 — 선택 점 없음. product-posts에서만 활성 표시 */
  const selected = (() => {
    if (pathname !== PRODUCT_POSTS_PATH) {
      return null;
    }
    if (!raw || raw === ALL_CATEGORY_NAV_ID) {
      return ALL_CATEGORY_NAV_ID;
    }
    return raw;
  })();

  return (
    <ul
      className={cn(
        "flex min-w-0 flex-1 flex-wrap items-center gap-x-8 gap-y-2",
        className
      )}
    >
      {items.map((item) => {
        const active = selected !== null && selected === item.id;
        return (
          <li key={item.id}>
            <Link
              href={categoryNavHref(item)}
              className="inline-flex"
              aria-current={active ? "page" : undefined}
            >
              <span
                className={cn(
                  "relative inline-flex font-sans text-[20px] leading-none transition-colors",
                  active
                    ? "text-vh-gray-300"
                    : "text-vh-gray-300 hover:text-[#F2CA7B]"
                )}
              >
                {item.label}
                {active ? (
                  <span
                    aria-hidden
                    className="vh-category-active-dot"
                  />
                ) : null}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
