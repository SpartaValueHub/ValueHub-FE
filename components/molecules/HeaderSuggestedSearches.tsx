"use client";

import { cn } from "@/lib/utils";

interface HeaderSuggestedSearchesProps {
  onSelect: (term: string) => void;
  items: readonly string[];
  title?: string;
  emptyMessage?: string;
  className?: string;
  attached?: boolean;
}

/** 추천검색어 뷰 — 검색 API 연동 전 더미 (Figma: 검색바 바로 아래) */
export function HeaderSuggestedSearches({
  onSelect,
  items,
  title = "추천검색어",
  emptyMessage = "연관 검색어가 없습니다.",
  className,
  attached = false,
}: HeaderSuggestedSearchesProps) {
  return (
    <div
      className={cn(
        attached
          ? "w-full rounded-[14px] border border-vh-gray-500/70 bg-[#2f2f2f] px-4 py-4 shadow-[0_10px_28px_rgba(0,0,0,0.28)]"
          : "w-full rounded-lg border border-vh-gray-700/90 bg-[#1a1a1a] px-4 py-4",
        className
      )}
    >
      <p className="font-sans text-[11px] text-vh-gray-500">{title}</p>
      {items.length > 0 ? (
        <ul className="mt-3 flex flex-col gap-3">
          {items.map((term) => (
            <li key={term}>
              <button
                type="button"
                className="font-sans text-[12px] text-vh-gray-100 transition-colors hover:text-[#F2CA7B]"
                onClick={() => onSelect(term)}
              >
                {term}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 font-sans text-[12px] text-vh-gray-300">
          {emptyMessage}
        </p>
      )}
    </div>
  );
}
