"use client";

import { useState } from "react";

import { Icon } from "@/components/atoms/icons";
import {
  Dialog,
  DialogCloseButton,
  DialogContent,
} from "@/components/molecules/overlay/Dialog";
import { ProductPostFilterPanel } from "@/components/organisms/listing/ProductPostFilterPanel";
import type {
  ProductListCenterHrefOpts,
  ProductPostConditionGrade,
  ProductPostDocumentFilter,
} from "@/constants/product-posts";
import { cn } from "@/lib/utils";
import type { UiBrandFilterOption } from "@/services/product-posts.service";

interface ProductPostMobileFilterProps {
  categoryUuid: string | null;
  activeSub: string | null;
  brands: UiBrandFilterOption[];
  selectedBrands: string[];
  maxPrice: number;
  selectedGrades: ProductPostConditionGrade[];
  docs: ProductPostDocumentFilter;
  keyword?: string | null;
  listCenter?: ProductListCenterHrefOpts | null;
  className?: string;
}

/** 모바일 필터 — Figma settings 아이콘 → Dialog + ProductPostFilterPanel */
export function ProductPostMobileFilter({
  categoryUuid,
  activeSub,
  brands,
  selectedBrands,
  maxPrice,
  selectedGrades,
  docs,
  keyword = null,
  listCenter = null,
  className,
}: ProductPostMobileFilterProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label="필터"
        className={cn(
          "flex size-4 shrink-0 items-center justify-center text-vh-gray-100",
          className
        )}
        onClick={() => setOpen(true)}
      >
        <Icon name="settings" size={14} />
      </button>

      <Dialog open={open} onOpenChange={setOpen} className="max-w-[360px]">
        <DialogContent
          showClose={false}
          padded={false}
          className="max-h-[85vh] overflow-y-auto rounded-lg bg-[#323232] p-0 text-vh-gray-100 shadow-none"
        >
          <div className="relative flex items-center justify-end px-2 pt-2">
            <DialogCloseButton
              onClose={() => setOpen(false)}
              className="static text-vh-gray-100 hover:bg-white/10"
            />
          </div>
          <ProductPostFilterPanel
            categoryUuid={categoryUuid}
            activeSub={activeSub}
            brands={brands}
            selectedBrands={selectedBrands}
            maxPrice={maxPrice}
            selectedGrades={selectedGrades}
            docs={docs}
            keyword={keyword}
            listCenter={listCenter}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

/** 정렬 UI — BE 미연동 시 alert (Figma 라벨: 최신순) */
export function ProductPostSortButton({
  label = "최신순",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={cn(
        "flex items-center gap-1 font-sans text-xs text-vh-gray-100 md:gap-2 md:text-sm md:text-[#ababab]",
        className
      )}
      onClick={() => {
        window.alert("정렬 기능은 준비 중입니다.");
      }}
    >
      {label}
      <Icon name="chevron-down" size={10} className="md:size-3.5" />
    </button>
  );
}
