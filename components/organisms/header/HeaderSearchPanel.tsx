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
  variant?: "desktop" | "mobile";
}

/** 헤더 검색 확장 패널 — search bar + 추천검색어 */
export function HeaderSearchPanel({
  className,
  onClose,
  variant = "desktop",
}: HeaderSearchPanelProps) {
  const [query, setQuery] = useState("");
  const isMobile = variant === "mobile";

  return (
    <div
      className={cn("relative w-full", !isMobile && "max-w-[800px]", className)}
    >
      <div
        className={cn(
          "flex items-center justify-between rounded-[55px] border border-white bg-[#323232]",
          isMobile
            ? "px-[18px] py-1.5"
            : "px-[26px] py-2 shadow-[0_0_5px_rgba(255,255,255,0.4)]"
        )}
      >
        <div
          className={cn(
            "flex min-w-0 flex-1 items-center",
            isMobile ? "gap-[5px]" : "gap-1.5"
          )}
        >
          <button
            type="button"
            className={cn(
              "inline-flex shrink-0 items-center gap-1 font-sans font-light text-white",
              isMobile ? "text-[13px]" : "text-base"
            )}
          >
            {MAIN_CATEGORY_PLACEHOLDER}
            <ChevronDown
              className={isMobile ? "size-3.5" : "size-[22px]"}
              strokeWidth={1.5}
            />
          </button>

          <VerticalDivider
            size={isMobile ? "sm" : "md"}
            className="bg-white/40"
          />

          <VhInput
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={MAIN_SEARCH_PLACEHOLDER}
            inputState={query ? "focus" : "default"}
            autoFocus={isMobile}
            className={cn(
              "min-w-0 flex-1 border-0 text-white placeholder:text-white/50 focus:text-white",
              isMobile ? "py-0.5 text-[13px]" : "py-1 text-base"
            )}
          />
        </div>

        <HeaderIconButton
          label="검색"
          onClick={onClose}
          className={isMobile ? "size-[22px]" : undefined}
        >
          <VhIcon
            src="/icons/header-search.svg"
            width={isMobile ? 22 : 30}
            height={isMobile ? 22 : 30}
          />
        </HeaderIconButton>
      </div>

      <div
        className={cn(
          isMobile
            ? "px-1.5 py-2.5"
            : "absolute top-[calc(100%+12px)] right-0 left-0 rounded-[15px] bg-[#323232] p-5 shadow-[0_0_5px_rgba(255,255,255,0.4)]"
        )}
      >
        <p
          className={cn(
            "font-sans text-[#d0d0d0]",
            isMobile
              ? "text-xs tracking-[-0.24px]"
              : "text-sm tracking-[-0.28px]"
          )}
        >
          추천검색어
        </p>
        <ul
          className={cn(
            "flex flex-col font-sans text-white",
            isMobile
              ? "mt-5 gap-3.5 text-sm tracking-[-0.28px]"
              : "mt-5 gap-2.5 text-base tracking-[-0.32px]"
          )}
        >
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
