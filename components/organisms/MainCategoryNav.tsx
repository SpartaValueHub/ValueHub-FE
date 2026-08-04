"use client";

import { useState } from "react";

import { CategoryNavItem } from "@/components/molecules/CategoryNavItem";
import { MAIN_CATEGORY_ROWS } from "@/constants/main-page";
import { cn } from "@/lib/utils";

interface MainCategoryNavProps {
  className?: string;
}

/** 메인 카테고리 — 1행 2개 / 구분선 / 2행 3개, 행별 space-around */
export function MainCategoryNav({ className }: MainCategoryNavProps) {
  const [activeId, setActiveId] = useState("luxury");
  const [primaryRow, secondaryRow] = MAIN_CATEGORY_ROWS;

  return (
    <nav
      aria-label="상품 카테고리"
      className={cn("w-full max-w-4xl", className)}
    >
      <ul className="flex w-full justify-around">
        {primaryRow.items.map((category) => (
          <li key={category.id}>
            <CategoryNavItem
              title={category.title}
              description={category.description}
              active={activeId === category.id}
              onClick={() => setActiveId(category.id)}
            />
          </li>
        ))}
      </ul>

      <div aria-hidden className="my-5 h-px w-full bg-vh-gray-100/20 md:my-6" />

      <ul className="flex w-full justify-around">
        {secondaryRow.items.map((category) => (
          <li key={category.id}>
            <CategoryNavItem
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
