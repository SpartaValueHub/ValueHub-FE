"use client";

import { useEffect } from "react";

import { Icon } from "@/components/atoms/icons";
import { BrandWordmark } from "@/components/molecules/brand/BrandWordmark";
import { HeaderSearchPanel } from "./HeaderSearchPanel";

interface HeaderMobileSearchProps {
  open: boolean;
  onClose: () => void;
}

/** 모바일 검색 화면 — 헤더 검색 버튼에서 전체 화면으로 노출 */
export function HeaderMobileSearch({ open, onClose }: HeaderMobileSearchProps) {
  useEffect(() => {
    if (!open) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col gap-5 bg-[#323232] pb-[50px] pt-10 md:hidden">
      <div className="flex items-center justify-between px-3.5 py-2.5">
        <button
          type="button"
          aria-label="검색 닫기"
          className="flex size-6 items-center justify-center text-vh-gray-100"
          onClick={onClose}
        >
          <Icon name="chevron-left" size={24} />
        </button>
        <BrandWordmark size="sm" className="leading-none" />
        <span
          className="flex size-[26px] items-center justify-center text-vh-gray-100"
          aria-hidden
        >
          <Icon name="search" size={26} />
        </span>
      </div>

      <HeaderSearchPanel variant="mobile" className="px-5" onClose={onClose} />
    </div>
  );
}
