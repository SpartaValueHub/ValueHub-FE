import Link from "next/link";

import { Icon } from "@/components/atoms/icons";
import { ListingSideActions } from "@/components/organisms/listing/ListingSideActions";
import { ProductPostFilterPanel } from "@/components/organisms/listing/ProductPostFilterPanel";
import { ProductPostGrid } from "@/components/organisms/listing/ProductPostGrid";
import {
  productPostsListHref,
  type ProductPostConditionGrade,
  type ProductPostDocumentFilter,
} from "@/constants/product-posts";
import { cn } from "@/lib/utils";
import type { UiBrandFilterOption } from "@/services/product-posts.service";
import type { UiCategorySummary } from "@/types/categories/ui";
import type { UiProductPostCardPage } from "@/types/product-posts/ui";

interface ProductPostListTemplateProps {
  title: string;
  categoryUuid: string | null;
  subCategories: UiCategorySummary[];
  brands: UiBrandFilterOption[];
  activeSub: string | null;
  selectedBrands: string[];
  maxPrice: number;
  selectedGrades: ProductPostConditionGrade[];
  docs: ProductPostDocumentFilter;
  list: UiProductPostCardPage;
  errorMessage?: string;
}

function pageItems(current: number, total: number) {
  if (total <= 1) return [1];
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  let start = Math.max(1, current - 2);
  const end = Math.min(total, start + 4);
  start = Math.max(1, end - 4);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

/** 카테고리 상품 목록 — Figma product_list + filter_drop */
export function ProductPostListTemplate({
  title,
  categoryUuid,
  subCategories,
  brands,
  activeSub,
  selectedBrands,
  maxPrice,
  selectedGrades,
  docs,
  list,
  errorMessage,
}: ProductPostListTemplateProps) {
  const pages = pageItems(list.page, Math.max(1, list.totalPages));
  const filterOpts = {
    category: categoryUuid,
    sub: activeSub,
    brands: selectedBrands,
    maxPrice,
    grades: selectedGrades,
    docs,
  };

  return (
    <main className="relative flex flex-1 flex-col bg-[#323232] pb-24 pt-[132px] md:pb-[120px] md:pt-[160px]">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-8 px-5 md:flex-row md:items-start md:gap-[90px] md:px-10">
        <aside className="hidden w-[340px] shrink-0 md:block">
          <div className="pt-10">
            <p className="font-sans text-xs text-[#ababab]">내 위치</p>
            <button
              type="button"
              className="mt-2 flex w-full items-center justify-between font-sans text-2xl leading-9 text-vh-gray-100"
            >
              <span>부산시 초량동</span>
              <Icon name="swap" size={24} className="text-[#ababab]" />
            </button>
          </div>

          <div className="mt-8">
            <ProductPostFilterPanel
              categoryUuid={categoryUuid}
              activeSub={activeSub}
              brands={brands}
              selectedBrands={selectedBrands}
              maxPrice={maxPrice}
              selectedGrades={selectedGrades}
              docs={docs}
            />
          </div>
        </aside>

        <div className="min-w-0 flex-1 md:max-w-[1010px]">
          <div className="flex flex-col items-center pt-6 md:pt-10">
            <button
              type="button"
              className="flex items-center gap-2.5 font-serif text-[32px] leading-none text-vh-gray-100 md:text-[36px]"
            >
              {title}
              <Icon name="chevron-down" size={34} />
            </button>
          </div>

          <div className="mt-10 flex flex-col gap-6">
            {subCategories.length > 0 ? (
              <nav
                aria-label="하위 카테고리"
                className="flex flex-wrap items-center justify-center gap-x-[30px] gap-y-2"
              >
                <Link
                  href={productPostsListHref({
                    ...filterOpts,
                    sub: null,
                    brands: [],
                    page: 1,
                  })}
                  className={cn(
                    "pb-1 font-sans text-base",
                    !activeSub
                      ? "border-b border-vh-gray-100 text-vh-gray-100"
                      : "text-[#ababab]"
                  )}
                >
                  전체상품
                </Link>
                {subCategories.map((child) => (
                  <Link
                    key={child.categoryUuid}
                    href={productPostsListHref({
                      ...filterOpts,
                      sub: child.categoryUuid,
                      brands: [],
                      page: 1,
                    })}
                    className={cn(
                      "pb-1 font-sans text-base",
                      activeSub === child.categoryUuid
                        ? "border-b border-vh-gray-100 text-vh-gray-100"
                        : "text-[#ababab]"
                    )}
                  >
                    {child.categoryName}
                  </Link>
                ))}
              </nav>
            ) : null}

            <div className="flex justify-end">
              <button
                type="button"
                className="flex items-center gap-2 font-sans text-sm text-[#ababab]"
              >
                최신순
                <Icon name="chevron-down" size={14} />
              </button>
            </div>
          </div>

          <div className="mt-8 md:mt-10">
            {errorMessage ? (
              <p className="font-sans text-sm text-[#ababab]">{errorMessage}</p>
            ) : (
              <ProductPostGrid
                items={list.items}
                banner={
                  <div className="flex h-[180px] w-full flex-col items-center justify-center bg-[#1e2a38] px-6 text-center md:h-[220px]">
                    <p className="font-sans text-xl tracking-wide text-vh-brand-gold md:text-3xl">
                      UP TO 70% OFF
                    </p>
                    <p className="mt-2 font-sans text-base text-vh-gray-100 md:text-2xl">
                      SUMMER SEASON OFF
                    </p>
                    <p className="mt-3 font-sans text-xs text-[#ababab]">
                      2026.07.20 - 08.11
                    </p>
                  </div>
                }
              />
            )}
          </div>

          {list.totalPages > 1 ? (
            <nav
              aria-label="목록 페이지"
              className="mt-12 flex items-center justify-center gap-2.5 font-sans text-sm text-[#ababab] md:mt-16"
            >
              {pages.map((page) => (
                <Link
                  key={page}
                  href={productPostsListHref({
                    ...filterOpts,
                    page,
                  })}
                  aria-current={page === list.page ? "page" : undefined}
                  className={cn(
                    "flex size-[30px] items-center justify-center",
                    page === list.page && "text-vh-gray-100"
                  )}
                >
                  {page}
                </Link>
              ))}
              {list.page < list.totalPages ? (
                <Link
                  href={productPostsListHref({
                    ...filterOpts,
                    page: list.page + 1,
                  })}
                  aria-label="다음 페이지"
                  className="flex size-[26px] items-center justify-center"
                >
                  <Icon name="chevron-right" size={16} />
                </Link>
              ) : null}
            </nav>
          ) : null}
        </div>
      </div>

      <ListingSideActions />
    </main>
  );
}

