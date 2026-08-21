"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { VerticalDivider } from "@/components/atoms/vertical-divider";
import { VhIcon } from "@/components/atoms/vh-icon";
import { VhInput } from "@/components/atoms/vh-input";
import { HeaderIconButton } from "@/components/molecules/header/HeaderIconButton";
import {
  HEADER_SEARCH_SUGGESTIONS,
  MAIN_CATEGORY_PLACEHOLDER,
  MAIN_SEARCH_PLACEHOLDER,
} from "@/constants/main-page";
import { cn } from "@/lib/utils";

interface HeaderSearchPanelProps {
  className?: string;
  onClose?: () => void;
}

/** 헤더 검색 확장 패널 — search bar + 추천검색어 */
export function HeaderSearchPanel({
  className,
  onClose,
}: HeaderSearchPanelProps) {
  const [query, setQuery] = useState("");

  return (
    <div className={cn("relative w-full max-w-[800px]", className)}>
      <div className="flex items-center justify-between rounded-[55px] border border-white bg-[#323232] px-[26px] py-2 shadow-[0_0_5px_rgba(255,255,255,0.4)]">
        <div className="flex min-w-0 flex-1 items-center gap-1.5">
          <button
            type="button"
            className="inline-flex shrink-0 items-center gap-1 font-sans text-base font-light text-white"
          >
            {MAIN_CATEGORY_PLACEHOLDER}
            <ChevronDown className="size-[22px]" strokeWidth={1.5} />
          </button>

          <VerticalDivider size="md" className="bg-white/40" />

          <VhInput
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={MAIN_SEARCH_PLACEHOLDER}
            inputState={query ? "focus" : "default"}
            className="min-w-0 flex-1 border-0 py-1 text-base text-white placeholder:text-white/50 focus:text-white"
          />
        </div>

        <HeaderIconButton label="검색" onClick={onClose}>
          <VhIcon src="/icons/header-search.svg" width={30} height={30} />
        </HeaderIconButton>
      </div>

      <div className="absolute left-0 right-0 top-[calc(100%+12px)] rounded-[15px] bg-[#323232] p-5 shadow-[0_0_5px_rgba(255,255,255,0.4)]">
        <p className="font-sans text-sm tracking-[-0.28px] text-[#d0d0d0]">
          추천검색어
        </p>
        <ul className="mt-5 flex flex-col gap-2.5 font-sans text-base tracking-[-0.32px] text-white">
          {HEADER_SEARCH_SUGGESTIONS.map((term) => (
            <li key={term}>
              <button
                type="button"
                className="transition-colors hover:text-vh-brand-gold"
                onClick={() => setQuery(term)}
              >
                {term}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

interface HeaderUtilityIconsProps {
  isAuthenticated: boolean;
  onSearchClick?: () => void;
  notificationCount?: number;
  chatCount?: number;
  searchCount?: number;
  /** 검색 아이콘 — 검색 패널이 열린 PC 헤더에서는 숨김 */
  showSearch?: boolean;
  /** 알림·채팅 — 모바일 헤더는 검색만, PC 로그인은 표시 */
  showInboxIcons?: boolean;
  className?: string;
}

function HeaderGlyph({ src }: { src: string }) {
  return <VhIcon src={src} width={30} height={30} />;
}

/** 헤더 우측 유틸 아이콘 — guest: search / login: search·알림·채팅 */
export function HeaderUtilityIcons({
  isAuthenticated,
  onSearchClick,
  notificationCount,
  chatCount,
  searchCount,
  showSearch = true,
  showInboxIcons = isAuthenticated,
  className,
}: HeaderUtilityIconsProps) {
  const router = useRouter();

  return (
    <div className={cn("flex h-[37px] items-center gap-[30px]", className)}>
      {showSearch ? (
        <HeaderIconButton
          label="검색"
          badgeCount={searchCount}
          onClick={onSearchClick}
        >
          <HeaderGlyph src="/icons/header-search.svg" />
        </HeaderIconButton>
      ) : null}

      {showInboxIcons ? (
        <>
          <HeaderIconButton label="알림" badgeCount={notificationCount}>
            <HeaderGlyph src="/icons/header-alert.svg" />
          </HeaderIconButton>
          <HeaderIconButton
            label="채팅"
            badgeCount={chatCount}
            onClick={() => router.push("/chat")}
          >
            <HeaderGlyph src="/icons/header-chat.svg" />
          </HeaderIconButton>
        </>
      ) : null}
    </div>
  );
}
