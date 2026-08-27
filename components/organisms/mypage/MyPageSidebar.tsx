"use client";

import { cn } from "@/lib/utils";
import type { UiMyPageSectionId } from "@/types/mypage/ui";

const NAV_ITEMS: { id: UiMyPageSectionId; label: string }[] = [
  { id: "account", label: "계정정보 관리" },
  { id: "trade", label: "거래정보 관리" },
];

interface MyPageSidebarProps {
  active: UiMyPageSectionId;
  onSelect: (id: UiMyPageSectionId) => void;
  className?: string;
}

export function MyPageSidebar({
  active,
  onSelect,
  className,
}: MyPageSidebarProps) {
  return (
    <nav
      aria-label="마이페이지 메뉴"
      className={cn("flex w-full flex-col gap-5 lg:w-[340px]", className)}
    >
      {NAV_ITEMS.map((item) => {
        const isActive = item.id === active;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className={cn(
              "w-full px-[50px] py-5 text-left font-sans text-xl text-white",
              isActive && "bg-white/10"
            )}
          >
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}
