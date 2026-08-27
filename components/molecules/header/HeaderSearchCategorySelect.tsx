"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { Popover } from "@/components/molecules/overlay/Popover";
import { MAIN_HEADER_NAV } from "@/constants/main-page";
import { ALL_CATEGORY_NAV_ID } from "@/constants/categories";
import { HEADER_SEARCH_CATEGORY_LABEL } from "@/constants/search";
import { cn } from "@/lib/utils";

interface HeaderSearchCategorySelectProps {
  value: string;
  onChange: (navId: string) => void;
  size?: "desktop" | "mobile";
  className?: string;
}

/** 헤더 검색바 대분류 — All/Luxury/Collectibles/Premium/Electrics (FE 상수) */
export function HeaderSearchCategorySelect({
  value,
  onChange,
  size = "desktop",
  className,
}: HeaderSearchCategorySelectProps) {
  const [open, setOpen] = useState(false);
  const isMobile = size === "mobile";
  const selected =
    MAIN_HEADER_NAV.find((item) => item.id === value) ?? MAIN_HEADER_NAV[0];
  const label =
    !value || value === ALL_CATEGORY_NAV_ID
      ? HEADER_SEARCH_CATEGORY_LABEL
      : selected.title;

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      className={cn("shrink-0", className)}
      contentClassName="mt-2 w-[160px] rounded-[10px] border border-white/20 bg-[#323232] p-1.5 shadow-[0_0_5px_rgba(255,255,255,0.25)]"
      trigger={
        <button
          type="button"
          aria-label="검색 카테고리"
          className={cn(
            "inline-flex shrink-0 items-center gap-1 font-sans font-light text-white",
            isMobile ? "text-[13px]" : "text-base"
          )}
        >
          <span className="max-w-[110px] truncate">{label}</span>
          <ChevronDown
            className={isMobile ? "size-3.5" : "size-[22px]"}
            strokeWidth={1.5}
          />
        </button>
      }
    >
      <ul className="flex w-full flex-col font-sans">
        {MAIN_HEADER_NAV.map((item) => {
          const isActive = item.id === value;
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => {
                  onChange(item.id);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full rounded-[6px] px-2.5 py-2 text-left text-sm transition-colors",
                  isActive
                    ? "bg-white/10 text-vh-brand-gold"
                    : "text-white hover:bg-white/10 hover:text-vh-brand-gold"
                )}
              >
                {item.title}
              </button>
            </li>
          );
        })}
      </ul>
    </Popover>
  );
}
