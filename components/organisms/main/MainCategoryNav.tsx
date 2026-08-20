"use client";

import { useState } from "react";

import { CategoryNavItem } from "@/components/molecules/main/CategoryNavItem";
import { MAIN_CATEGORY_ROWS } from "@/constants/main-page";
import { cn } from "@/lib/utils";

interface MainCategoryNavProps {
  className?: string;
}

/** 메인 카테고리 — 1행 2개 / 2행 3개, 행별 space-around */
export function MainCategoryNav({ className }: MainCategoryNavProps) {
  const [activeId, setActiveId] = useState("all");
  const [primaryRow, secondaryRow] = MAIN_CATEGORY_ROWS;

  return (
    <nav
      aria-label="상품 카테고리"
      className={cn(
        "flex w-full max-w-[1200px] flex-col items-center gap-8 md:gap-10",
        className
      )}
    >
      <ul className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 md:gap-8 md:px-[210px]">
        {primaryRow.items.map((category) => (
          <li key={category.id}>
            <CategoryNavItem
              className="w-full"
              title={category.title}
              description={category.description}
              active={activeId === category.id}
              onClick={() => setActiveId(category.id)}
            />
          </li>
        ))}
      </ul>

      <ul className="grid w-full grid-cols-1 gap-5 sm:grid-cols-3 md:gap-8">
        {secondaryRow.items.map((category) => (
          <li key={category.id}>
            <CategoryNavItem
              className="w-full"
              title={category.title}
              description={category.description}
              active={activeId === category.id}
              onClick={() => setActiveId(category.id)}
            />
          </li>
        ))}
      </ul>
    </nav>
  );
}
