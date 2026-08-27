import Link from "next/link";

import { Icon } from "@/components/atoms/icons";
import { ListingSideActions } from "@/components/organisms/listing/ListingSideActions";
import { ProductPostFilterPanel } from "@/components/organisms/listing/ProductPostFilterPanel";
import { ProductPostGrid } from "@/components/organisms/listing/ProductPostGrid";
import {
  ProductPostMobileFilter,
  ProductPostSortButton,
} from "@/components/organisms/listing/ProductPostMobileFilter";
import { MainBottomNav } from "@/components/organisms/main/MainBottomNav";
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
  keyword?: string | null;
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

/** 카테고리 상품 목록 — Figma product_list PC + 모바일(1121:6694) */
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
  keyword = null,
  list,
  errorMessage,
}: ProductPostListTemplateProps) {
  const pages = pageItems(list.page, Math.max(1, list.totalPages));
  const filterOpts = {
    category: categoryUuid,
    sub: activeSub,
    brands: selectedBrands,
    maxPrice,
    selectedGrades,
    docs,
    keyword,
  };

  return (
    <main className="relative flex flex-1 flex-col bg-[#323232] pb-[90px] pt-[72px] md:pb-[120px] md:pt-[160px]">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-[30px] px-[3px] md:flex-row md:items-start md:gap-[90px] md:px-10">
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
              keyword={keyword}
            />
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-[30px] md:max-w-[1010px] md:gap-0">
          {/* 모바일: Luxury + 초량동 칩 (드롭다운 아이콘 없음 — 헤더 카테고리 내비 사용) */}
          <div className="flex items-end justify-between px-2.5 md:hidden">
            <p className="font-sans text-xl font-medium leading-none text-vh-gray-100">
              {title}
            </p>
            <button
              type="button"
              className="flex items-center gap-0.5 rounded-[5px] border border-[#868686] px-2 py-1 font-sans text-xs text-vh-gray-100"
            >
              <Icon
                name="location-pin"
                size={10}
                className="text-vh-gray-100"
              />
              <span>초량동</span>
              <Icon name="swap" size={10} className="text-[#ababab]" />
            </button>
          </div>

          {/* PC 타이틀 */}
          <div className="hidden flex-col items-center pt-10 md:flex">
            <p className="font-serif text-[36px] leading-none text-vh-gray-100">
              {title}
            </p>
          </div>

          {subCategories.length > 0 ? (
            <nav
              aria-label="하위 카테고리"
              className="flex w-full items-center justify-between gap-x-1 overflow-x-auto px-1 [-ms-overflow-style:none] [scrollbar-width:none] md:mt-10 md:flex-wrap md:justify-center md:gap-x-[30px] md:gap-y-2 md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden"
            >
              <Link
                href={productPostsListHref({
                  ...filterOpts,
                  sub: null,
                  brands: [],
                  page: 1,
                })}
                className={cn(
                  "shrink-0 px-1 pb-1 font-sans text-sm whitespace-nowrap md:text-base",
                  !activeSub
                    ? "border-b border-vh-gray-100 text-vh-gray-100"
                    : "text-vh-gray-100 md:text-[#ababab]"
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
                    "shrink-0 px-1 pb-1 font-sans text-sm whitespace-nowrap md:text-base",
                    activeSub === child.categoryUuid
                      ? "border-b border-vh-gray-100 text-vh-gray-100"
                      : "text-vh-gray-100 md:text-[#ababab]"
                  )}
                >
                  {child.categoryName}
                </Link>
              ))}
            </nav>
          ) : null}

          <div className="flex flex-col gap-2.5 md:mt-6 md:gap-6">
            {/* 모바일: settings | 최신순 (Figma sort) */}
            <div className="flex items-center justify-between p-1.5 md:hidden">
              <ProductPostMobileFilter
                categoryUuid={categoryUuid}
                activeSub={activeSub}
                brands={brands}
                selectedBrands={selectedBrands}
                maxPrice={maxPrice}
                selectedGrades={selectedGrades}
                docs={docs}
                keyword={keyword}
              />
              <ProductPostSortButton label="최신순" />
            </div>

            {/* PC: 정렬 */}
            <div className="hidden justify-end md:flex">
              <ProductPostSortButton label="최신순" />
            </div>

            <div className="md:mt-4">
              {errorMessage ? (
                <p className="font-sans text-sm text-[#ababab]">
                  {errorMessage}
                </p>
              ) : (
                <ProductPostGrid
                  items={list.items}
                  banner={
                    <div className="hidden h-[220px] w-full flex-col items-center justify-center bg-[#1e2a38] px-6 text-center md:flex">
                      <p className="font-sans text-3xl tracking-wide text-vh-brand-gold">
                        UP TO 70% OFF
                      </p>
                      <p className="mt-2 font-sans text-2xl text-vh-gray-100">
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
          </div>

          {list.totalPages > 1 ? (
            <nav
              aria-label="목록 페이지"
              className="flex items-center justify-center gap-2.5 font-sans text-base text-[#ababab] md:mt-16"
            >
              {list.page > 1 ? (
                <Link
                  href={productPostsListHref({
                    ...filterOpts,
                    page: list.page - 1,
                  })}
                  aria-label="이전 페이지"
                  className="flex size-[26px] items-center justify-center"
                >
                  <Icon name="chevron-left" size={16} />
                </Link>
              ) : (
                <span className="flex size-[26px] items-center justify-center opacity-30 md:hidden">
                  <Icon name="chevron-left" size={16} />
                </span>
              )}
              {pages.map((page) => (
                <Link
                  key={page}
                  href={productPostsListHref({
                    ...filterOpts,
                    page,
                  })}
                  aria-current={page === list.page ? "page" : undefined}
                  className={cn(
                    "flex h-[30px] min-w-[30px] items-center justify-center px-2.5 py-1",
                    page === list.page
                      ? "rounded border border-[#ababab] font-medium text-vh-gray-100 md:rounded-none md:border-0"
                      : "font-light text-vh-gray-100 md:text-[#ababab]"
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
              ) : (
                <span className="flex size-[26px] items-center justify-center opacity-30">
                  <Icon name="chevron-right" size={16} />
                </span>
              )}
            </nav>
          ) : null}
        </div>
      </div>

      <ListingSideActions className="bottom-[97px] right-[15px] gap-2.5 md:bottom-8 md:right-8 md:gap-6" />
      <MainBottomNav activeId="category" className="bottom-4" />
    </main>
  );
}
