"use client";

import { useState } from "react";

import { VhIcon } from "@/components/atoms/vh-icon";
import { Popover } from "@/components/molecules/overlay/Popover";
import { cn } from "@/lib/utils";

export type CategoryDropdownOption = {
  id: string;
  title: string;
  description: string;
};

export const CATEGORY_DROPDOWN_OPTIONS: CategoryDropdownOption[] = [
  { id: "luxury", title: "Luxury", description: "명품·시계·주얼리" },
  {
    id: "collectibles",
    title: "Collectibles",
    description: "한정판·피규어·소장품",
  },
  { id: "premium", title: "Premium", description: "미술품·골동품" },
  { id: "electric", title: "Electric", description: "카메라·오디오·전자기기" },
];

interface CategoryDropdownProps {
  value?: string;
  onChange?: (id: string) => void;
  options?: CategoryDropdownOption[];
  placeholder?: string;
  className?: string;
}

/** Figma 드롭다운 — 대분류 트리거 + 카테고리 메뉴 */
export function CategoryDropdown({
  value,
  onChange,
  options = CATEGORY_DROPDOWN_OPTIONS,
  placeholder = "대분류",
  className,
}: CategoryDropdownProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.id === value);

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      className={cn("w-[230px]", className)}
      contentClassName="mt-2.5 w-full rounded-[4px] border-0 bg-white p-1.5 shadow-none"
      trigger={
        <button
          type="button"
          className="flex w-full items-center justify-between border border-[#d0d0d0] py-2.5 pl-2.5 pr-1 font-sans text-base leading-[1.4]"
        >
          <span className={selected ? "text-vh-gray-100" : "text-[#ababab]"}>
            {selected?.title ?? placeholder}
          </span>
          <VhIcon src="/icons/dropdown-chevron.svg" width={22} height={22} />
        </button>
      }
    >
      <ul className="flex w-full flex-col font-sans">
        {options.map((option) => (
          <li key={option.id}>
            <button
              type="button"
              onClick={() => {
                onChange?.(option.id);
                setOpen(false);
              }}
              className="flex w-full items-center gap-1.5 rounded-[3px] px-1.5 py-2.5 text-left hover:bg-[rgba(239,187,85,0.15)]"
            >
              <span className="text-base text-[#323232]">{option.title}</span>
              <span className="text-sm text-[#ababab]">
                {option.description}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </Popover>
  );
}
