"use client";

import { ChevronDown, Search } from "lucide-react";

import {
  MAIN_CATEGORY_PLACEHOLDER,
  MAIN_SEARCH_PLACEHOLDER,
} from "@/constants/main-page";
import { cn } from "@/lib/utils";

interface MainSearchBarProps {
  className?: string;
}

/** 메인 검색바 — 카테고리 드롭다운 UI만 (BE 미연동) */
export function MainSearchBar({ className }: MainSearchBarProps) {
  return (
    <form
      role="search"
      className={cn(
        "flex h-12 w-full max-w-xl items-center rounded-full border border-vh-gray-100/90 px-3 md:h-14 md:max-w-[750px] md:px-3",
        className
      )}
      onSubmit={(event) => event.preventDefault()}
    >
      <button
        type="button"
        className="flex shrink-0 items-center gap-1 px-1 py-1 font-sans text-sm text-vh-gray-500 md:px-0 md:text-base"
        aria-label="카테고리 선택"
      >
        {MAIN_CATEGORY_PLACEHOLDER}
        <ChevronDown className="size-4 md:size-5" aria-hidden />
      </button>
      <span aria-hidden className="mx-3 h-6 w-px shrink-0 bg-vh-gray-100/40" />
      <input
        type="search"
        name="q"
        placeholder={MAIN_SEARCH_PLACEHOLDER}
        className="min-w-0 flex-1 bg-transparent font-sans text-sm text-vh-gray-100 outline-none placeholder:text-vh-gray-700 md:text-base"
        aria-label={MAIN_SEARCH_PLACEHOLDER}
      />
      <button
        type="submit"
        className="shrink-0 p-2 text-vh-gray-100 transition-colors hover:text-vh-gold-500"
        aria-label="검색"
      >
        <Search className="size-5 md:size-6" strokeWidth={2.5} aria-hidden />
      </button>
    </form>
  );
}
