"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useEffectEvent, useRef, useState } from "react";

import { ALL_CATEGORY_NAV_ID } from "@/constants/categories";
import { HEADER_SEARCH_CATEGORY_LABEL } from "@/constants/search";
import { cn } from "@/lib/utils";
import type { UiCategoryNavItem } from "@/types/categories/ui";

interface HeaderSearchCategorySelectProps {
  items: UiCategoryNavItem[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
}

/** 검색바 왼쪽 카테고리 드롭다운 — 값은 categoryUuid, 검색 API는 미연동 */
export function HeaderSearchCategorySelect({
  items,
  value,
  onChange,
  className,
}: HeaderSearchCategorySelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = items.find((item) => item.id === value);
  const buttonLabel =
    !selected || selected.id === ALL_CATEGORY_NAV_ID
      ? HEADER_SEARCH_CATEGORY_LABEL
      : selected.label;

  const onDocumentPointerDown = useEffectEvent((event: MouseEvent) => {
    if (!open) return;
    const target = event.target;
    if (!(target instanceof Node)) return;
    if (rootRef.current?.contains(target)) return;
    setOpen(false);
  });

  useEffect(() => {
    document.addEventListener("mousedown", onDocumentPointerDown);
    return () => {
      document.removeEventListener("mousedown", onDocumentPointerDown);
    };
  }, []);

  return (
    <div ref={rootRef} className={cn("relative shrink-0", className)}>
      <button
        type="button"
        className="flex items-center gap-1 font-sans text-[12px] text-vh-gray-300 transition-colors hover:text-[#F2CA7B]"
        aria-label="검색 카테고리"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className="max-w-[7rem] truncate">{buttonLabel}</span>
        <ChevronDown className="size-3.5 shrink-0" strokeWidth={1.5} />
      </button>

      {open ? (
        <ul
          role="listbox"
          className="absolute left-0 top-[calc(100%+0.5rem)] z-50 max-h-64 min-w-[10rem] overflow-auto rounded-md border border-vh-gray-700 bg-vh-surface-charcoal py-1 shadow-lg"
        >
          {items.map((item) => {
            const active = item.id === (selected?.id ?? ALL_CATEGORY_NAV_ID);
            return (
              <li key={item.id} role="option" aria-selected={active}>
                <button
                  type="button"
                  className={cn(
                    "flex w-full px-3 py-2 text-left font-sans text-sm transition-colors",
                    active
                      ? "text-[#F2CA7B]"
                      : "text-vh-gray-300 hover:bg-vh-gray-700/40 hover:text-vh-gray-100"
                  )}
                  onClick={() => {
                    onChange(item.id);
                    setOpen(false);
                  }}
                >
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
