"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { listRootCategoriesAction } from "@/actions/categories";
import { CategoryNavItem } from "@/components/molecules/main/CategoryNavItem";
import { MAIN_CATEGORY_ROWS } from "@/constants/main-page";
import { productPostsHref } from "@/constants/product-posts";
import { cn } from "@/lib/utils";

interface MainCategoryNavProps {
  className?: string;
}

/** 메인 타일 → product-posts. All은 쿼리 없음, 나머지는 categoryUuid */
async function productPostsHrefForMainCategory(id: string, title: string) {
  if (id === "all") return productPostsHref();

  const result = await listRootCategoriesAction();
  if (!result.ok) return productPostsHref();

  const matched = result.data.find(
    (category) => category.categoryName.toLowerCase() === title.toLowerCase()
  );

  if (!matched) return productPostsHref();
  return productPostsHref(matched.categoryUuid);
}

/** 메인 카테고리 — 1행 2개 / 2행 3개, 행별 space-around */
export function MainCategoryNav({ className }: MainCategoryNavProps) {
  const router = useRouter();
  const [activeId, setActiveId] = useState("all");
  const [primaryRow, secondaryRow] = MAIN_CATEGORY_ROWS;

  const onSelect = async (id: string, title: string) => {
    setActiveId(id);
    const href = await productPostsHrefForMainCategory(id, title);
    router.push(href);
  };

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
              onClick={() => {
                void onSelect(category.id, category.title);
              }}
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
              onClick={() => {
                void onSelect(category.id, category.title);
              }}
            />
          </li>
        ))}
      </ul>
    </nav>
  );
}
