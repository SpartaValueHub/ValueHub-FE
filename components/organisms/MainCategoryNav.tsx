"use client";

import { useState } from "react";

import { CategoryNavItem } from "@/components/molecules/CategoryNavItem";
import { MAIN_CATEGORY_ROWS } from "@/constants/main-page";
import { cn } from "@/lib/utils";

interface MainCategoryNavProps {
  className?: string;
}

/** 메인 카테고리 — 1행 2개 / 구분선 / 2행 3개 (목업 동일) */
export function MainCategoryNav({ className }: MainCategoryNavProps) {
  const [activeId, setActiveId] = useState("all");
  const [primaryRow, secondaryRow] = MAIN_CATEGORY_ROWS;

  return (
    <nav
      aria-label="상품 카테고리"
      className={cn("flex w-full max-w-4xl flex-col items-center", className)}
    >
      <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3 md:gap-x-20">
        {primaryRow.map((category) => (
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

      <div
        aria-hidden
        className="my-5 h-px w-full max-w-3xl bg-white/15 md:my-6"
      />

      <ul className="flex w-full max-w-3xl flex-wrap items-center justify-center gap-x-6 gap-y-3 md:justify-between md:gap-x-8">
        {secondaryRow.map((category) => (
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
