"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent, type KeyboardEvent } from "react";

import { VerticalDivider } from "@/components/atoms/vertical-divider";
import { VhIcon } from "@/components/atoms/vh-icon";
import { VhInput } from "@/components/atoms/vh-input";
import { HeaderIconButton } from "@/components/molecules/header/HeaderIconButton";
import { HeaderSearchCategorySelect } from "@/components/molecules/header/HeaderSearchCategorySelect";
import { ALL_CATEGORY_NAV_ID } from "@/constants/categories";
import { HEADER_SEARCH_PLACEHOLDER } from "@/constants/search";
import {
  headerCategoryRootUuid,
  productPostsListHref,
} from "@/constants/product-posts";
import { useHeaderSearchTerms } from "@/hooks/search/useHeaderSearchTerms";
import { ensureSearchSessionId } from "@/lib/search/session";
import { cn } from "@/lib/utils";

interface HeaderSearchPanelProps {
  className?: string;
  onClose?: () => void;
  variant?: "desktop" | "mobile";
}

function panelLabel(mode: "popular" | "related" | "suggestions") {
  // 입력 중 suggestions/related 모두 UI 라벨은 연관검색어로 통일
  return mode === "popular" ? "추천검색어" : "연관검색어";
}

/** 헤더 검색 확장 패널 — popular / related / suggestions + Enter 목록 이동 */
export function HeaderSearchPanel({
  className,
  onClose,
  variant = "desktop",
}: HeaderSearchPanelProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [categoryNavId, setCategoryNavId] =
    useState<string>(ALL_CATEGORY_NAV_ID);
  const { terms, mode } = useHeaderSearchTerms(query);
  const isMobile = variant === "mobile";
  const showTermsPanel = terms.length > 0;

  useEffect(() => {
    ensureSearchSessionId();
  }, []);

  function submitSearch(raw: string) {
    const q = raw.trim();
    const categoryUuid = headerCategoryRootUuid(categoryNavId);
    if (!q && !categoryUuid) return;
    ensureSearchSessionId();
    onClose?.();
    router.push(
      productPostsListHref({
        keyword: q || null,
        category: categoryUuid,
        page: 1,
      })
    );
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    submitSearch(query);
  }

  function onInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      submitSearch(query);
    }
  }

  return (
    <div
      className={cn("relative w-full", !isMobile && "max-w-[800px]", className)}
    >
      <form
        onSubmit={onSubmit}
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
          <HeaderSearchCategorySelect
            value={categoryNavId}
            onChange={setCategoryNavId}
            size={isMobile ? "mobile" : "desktop"}
          />

          <VerticalDivider
            size={isMobile ? "sm" : "md"}
            className="bg-white/40"
          />

          <VhInput
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onInputKeyDown}
            placeholder={HEADER_SEARCH_PLACEHOLDER}
            inputState={query ? "focus" : "default"}
            autoFocus
            className={cn(
              "min-w-0 flex-1 border-0 text-white placeholder:text-white/50 focus:text-white",
              isMobile ? "py-0.5 text-[13px]" : "py-1 text-base"
            )}
          />
        </div>

        <HeaderIconButton
          label="검색"
          type="submit"
          className={isMobile ? "size-[22px]" : undefined}
        >
          <VhIcon
            src="/icons/header-search.svg"
            width={isMobile ? 22 : 30}
            height={isMobile ? 22 : 30}
          />
        </HeaderIconButton>
      </form>

      {showTermsPanel ? (
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
            {panelLabel(mode)}
          </p>
          <ul
            className={cn(
              "flex flex-col font-sans text-white",
              isMobile
                ? "mt-5 gap-3.5 text-sm tracking-[-0.28px]"
                : "mt-5 gap-2.5 text-base tracking-[-0.32px]"
            )}
          >
            {terms.map((term) => (
              <li key={term}>
                <button
                  type="button"
                  className="transition-colors hover:text-vh-brand-gold"
                  onClick={() => submitSearch(term)}
                >
                  {term}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
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
          data-header-search-toggle=""
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
