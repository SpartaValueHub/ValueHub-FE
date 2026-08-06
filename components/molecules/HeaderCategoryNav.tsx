"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { ALL_CATEGORY_NAV_ID } from "@/constants/categories";
import { cn } from "@/lib/utils";
import type { UiCategoryNavItem } from "@/types/categories/ui";

interface HeaderCategoryNavProps {
  items: UiCategoryNavItem[];
  className?: string;
}

/** Listing 헤더용. All → /listings, 그 외 → /listings?category={categoryUuid} */
export function categoryNavHref(id: string) {
  if (id === ALL_CATEGORY_NAV_ID) return "/listings";
  return `/listings?category=${encodeURIComponent(id)}`;
}

export function HeaderCategoryNav({
  items,
  className,
}: HeaderCategoryNavProps) {
  const searchParams = useSearchParams();
  const raw = searchParams.get("category")?.trim();
  const selected =
    !raw || raw === ALL_CATEGORY_NAV_ID ? ALL_CATEGORY_NAV_ID : raw;

  return (
    <ul
      className={cn(
        "flex min-w-0 flex-1 flex-wrap items-center gap-x-8 gap-y-2 md:gap-x-12 lg:gap-x-14",
        className
      )}
    >
      {items.map((item) => {
        const active = selected === item.id;
        return (
          <li key={item.id}>
            <Link
              href={categoryNavHref(item.id)}
              className={cn(
                "font-serif text-sm tracking-wide transition-colors md:text-[15px]",
                active
                  ? "vh-text-category-active"
                  : "text-vh-gray-500 hover:text-vh-gray-300"
              )}
              aria-current={active ? "page" : undefined}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
