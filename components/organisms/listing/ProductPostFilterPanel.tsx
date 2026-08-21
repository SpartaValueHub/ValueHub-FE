"use client";

import { useRouter } from "next/navigation";
import { useState, type CSSProperties, type ReactNode } from "react";

import { Checkbox } from "@/components/atoms/checkbox";
import { Icon } from "@/components/atoms/icons";
import {
  PRODUCT_POST_PRICE_FILTER_MAX_WON,
  PRODUCT_POST_PRICE_FILTER_MIN_WON,
  productPostsListHref,
  type ProductPostConditionGrade,
  type ProductPostDocumentFilter,
} from "@/constants/product-posts";
import { cn } from "@/lib/utils";
import type { UiBrandFilterOption } from "@/services/product-posts.service";

const GRADES: ProductPostConditionGrade[] = ["S", "A", "B", "C"];
const PRICE_MIN_MAN = PRODUCT_POST_PRICE_FILTER_MIN_WON / 10_000;
const PRICE_MAX_MAN = PRODUCT_POST_PRICE_FILTER_MAX_WON / 10_000;

interface ProductPostFilterPanelProps {
  categoryUuid: string | null;
  activeSub: string | null;
  brands: UiBrandFilterOption[];
  selectedBrands: string[];
  maxPrice: number;
  selectedGrades: ProductPostConditionGrade[];
  docs: ProductPostDocumentFilter;
  className?: string;
}

function FilterSection({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-[#606060] px-5 py-5">
      <button
        type="button"
        className="flex w-full items-center justify-between"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="font-sans text-base text-white">{title}</span>
        <Icon
          name="chevron-down"
          size={20}
          className={cn("text-white transition-transform", open && "rotate-180")}
        />
      </button>
      {open ? <div className="mt-5">{children}</div> : null}
    </div>
  );
}

function isBrandSelected(
  brand: UiBrandFilterOption,
  selectedBrands: string[]
) {
  return brand.categoryUuids.some((uuid) => selectedBrands.includes(uuid));
}

/** Figma filter_drop — 브랜드/가격/서류/등급 → 목록 쿼리 */
export function ProductPostFilterPanel({
  categoryUuid,
  activeSub,
  brands,
  selectedBrands,
  maxPrice,
  selectedGrades,
  docs,
  className,
}: ProductPostFilterPanelProps) {
  const router = useRouter();
  const priceMan = Math.round(maxPrice / 10_000);
  const clampedMan = Math.min(
    PRICE_MAX_MAN,
    Math.max(PRICE_MIN_MAN, priceMan)
  );
  const pricePct =
    ((clampedMan - PRICE_MIN_MAN) / (PRICE_MAX_MAN - PRICE_MIN_MAN)) * 100;

  const pushFilters = (next: {
    brands?: string[];
    maxPrice?: number;
    grades?: ProductPostConditionGrade[];
    docs?: ProductPostDocumentFilter;
  }) => {
    router.push(
      productPostsListHref({
        category: categoryUuid,
        sub: activeSub,
        page: 1,
        brands: next.brands ?? selectedBrands,
        maxPrice: next.maxPrice ?? maxPrice,
        grades: next.grades ?? selectedGrades,
        docs: next.docs ?? docs,
      })
    );
  };

  const toggleBrand = (brand: UiBrandFilterOption) => {
    const selected = isBrandSelected(brand, selectedBrands);
    const next = selected
      ? selectedBrands.filter((id) => !brand.categoryUuids.includes(id))
      : [...new Set([...selectedBrands, ...brand.categoryUuids])];
    pushFilters({ brands: next });
  };

  const toggleGrade = (grade: ProductPostConditionGrade) => {
    const next = selectedGrades.includes(grade)
      ? selectedGrades.filter((g) => g !== grade)
      : [...selectedGrades, grade];
    pushFilters({ grades: next });
  };

  const setDocs = (value: ProductPostDocumentFilter) => {
    pushFilters({ docs: value });
  };

  const resetFilters = () => {
    router.push(
      productPostsListHref({
        category: categoryUuid,
        sub: activeSub,
        page: 1,
      })
    );
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between px-5 py-5">
        <h2 className="font-sans text-base text-vh-gray-100">필터</h2>
        <button
          type="button"
          aria-label="필터 초기화"
          className="text-[#ababab]"
          onClick={resetFilters}
        >
          <Icon name="refresh" size={24} />
        </button>
      </div>

      <FilterSection title="브랜드">
        {brands.length === 0 ? (
          <p className="font-sans text-sm text-[#ababab]">
            선택 가능한 브랜드가 없습니다.
          </p>
        ) : (
          <ul className="flex max-h-[280px] flex-col gap-2.5 overflow-y-auto">
            {brands.map((brand) => (
              <li key={brand.name}>
                <Checkbox
                  id={`brand-${brand.name}`}
                  label={brand.name}
                  className="gap-1.5 text-base"
                  checked={isBrandSelected(brand, selectedBrands)}
                  onChange={() => toggleBrand(brand)}
                />
              </li>
            ))}
          </ul>
        )}
      </FilterSection>

      <FilterSection title="가격">
        <div className="flex flex-col gap-8">
          <div className="flex justify-between font-sans text-xs text-white">
            <span>50만원</span>
            <span>1000만원 이상</span>
          </div>
          <input
            type="range"
            min={PRICE_MIN_MAN}
            max={PRICE_MAX_MAN}
            step={10}
            value={clampedMan}
            aria-label="최대 가격"
            className="vh-price-range w-full"
            style={
              {
                "--vh-price-pct": `${Math.min(100, Math.max(0, pricePct))}%`,
              } as CSSProperties
            }
            onChange={(e) =>
              pushFilters({
                maxPrice: Number(e.target.value) * 10_000,
              })
            }
          />
          <p className="font-sans text-sm text-[#ababab]">
            {clampedMan >= PRICE_MAX_MAN
              ? "1000만원 이상"
              : `최대 ${clampedMan.toLocaleString("ko-KR")}만원`}
          </p>
        </div>
      </FilterSection>

      <FilterSection title="인증 서류">
        <div className="flex flex-wrap gap-5">
          <Checkbox
            id="docs-all"
            label="전체보기"
            className="gap-1.5 text-base"
            checked={docs === "all"}
            onChange={() => setDocs("all")}
          />
          <Checkbox
            id="docs-attached"
            label="첨부된 상품"
            className="gap-1.5 text-base"
            checked={docs === "attached"}
            onChange={() => setDocs("attached")}
          />
        </div>
      </FilterSection>

      <FilterSection title="상품 상태 등급">
        <ul className="flex flex-col gap-2.5">
          {GRADES.map((grade) => (
            <li key={grade}>
              <Checkbox
                id={`grade-${grade}`}
                label={`${grade} 급`}
                className="gap-1.5 text-base"
                checked={selectedGrades.includes(grade)}
                onChange={() => toggleGrade(grade)}
              />
            </li>
          ))}
        </ul>
      </FilterSection>
    </div>
  );
}
