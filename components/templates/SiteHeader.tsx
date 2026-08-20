"use client";

import Link from "next/link";
import { Bell, MessageCircle, Search } from "lucide-react";
import {
  Suspense,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from "react";

import { HeaderCategoryNav } from "@/components/molecules/HeaderCategoryNav";
import { HeaderSearchCategorySelect } from "@/components/molecules/HeaderSearchCategorySelect";
import { HeaderSuggestedSearches } from "@/components/molecules/HeaderSuggestedSearches";
import { SiteHeaderLogo } from "@/components/molecules/SiteHeaderLogo";
import { useAppSession } from "@/context/SessionContext";
import {
  ALL_CATEGORY_NAV_ID,
  HEADER_ROOT_CATEGORY_FALLBACK,
} from "@/constants/categories";
import {
  HEADER_SEARCH_PLACEHOLDER,
  HEADER_SUGGESTED_SEARCHES,
} from "@/constants/search";
import { cn } from "@/lib/utils";
import type { UiCategoryNavItem } from "@/types/categories/ui";

const fallbackNavItems = HEADER_ROOT_CATEGORY_FALLBACK;

const authTextLinkClassName =
  "font-sans text-[14px] text-vh-gray-300 transition-colors hover:text-[#F2CA7B]";

const iconButtonClassName =
  "rounded-sm p-1 text-vh-gray-100 transition-colors hover:text-[#F2CA7B]";

interface SiteHeaderProps {
  categoryNavItems?: UiCategoryNavItem[];
  className?: string;
}

function CategoryNavFallback({ items }: { items: UiCategoryNavItem[] }) {
  return (
    <ul className="flex min-w-0 flex-wrap gap-x-8">
      {items.map((item) => (
        <li
          key={item.id}
          className="font-sans text-[20px] text-vh-gray-300"
        >
          {item.label}
        </li>
      ))}
    </ul>
  );
}

function CategoryNavSlot({ items }: { items: UiCategoryNavItem[] }) {
  return (
    <Suspense fallback={<CategoryNavFallback items={items} />}>
      <HeaderCategoryNav items={items} className="flex-none" />
    </Suspense>
  );
}

/**
 * Figma header-logout / header-login / header-search
 * 닫힘: 1행 로고|검색·아이콘, 2행 카테고리|auth
 * 열림: 좌(로고+카테고리) | 중(검색바+추천) | 우(아이콘+auth)
 */
export function SiteHeader({
  categoryNavItems = fallbackNavItems,
  className,
}: SiteHeaderProps) {
  const { isAuthenticated, isLoading, logout } = useAppSession();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCategoryId, setSearchCategoryId] =
    useState<string>(ALL_CATEGORY_NAV_ID);
  const searchPanelRef = useRef<HTMLDivElement>(null);
  const navItems =
    categoryNavItems.length > 0 ? categoryNavItems : fallbackNavItems;
  const trimmedQuery = searchQuery.trim();
  const filteredSuggestions = HEADER_SUGGESTED_SEARCHES.filter((term) =>
    trimmedQuery.length === 0
      ? true
      : term.toLowerCase().includes(trimmedQuery.toLowerCase())
  );

  const onDocumentPointerDown = useEffectEvent((event: MouseEvent) => {
    if (!searchOpen) return;
    const target = event.target;
    if (!(target instanceof Node)) return;
    if (searchPanelRef.current?.contains(target)) return;
    setSearchOpen(false);
  });

  const onDocumentKeyDown = useEffectEvent((event: KeyboardEvent) => {
    if (!searchOpen) return;
    if (event.key === "Escape") setSearchOpen(false);
  });

  useEffect(() => {
    document.addEventListener("mousedown", onDocumentPointerDown);
    document.addEventListener("keydown", onDocumentKeyDown);
    return () => {
      document.removeEventListener("mousedown", onDocumentPointerDown);
      document.removeEventListener("keydown", onDocumentKeyDown);
    };
  }, []);

  const authLinks = (
    <nav className="flex shrink-0 items-center gap-4 whitespace-nowrap">
      {isLoading ? (
        <>
          <span
            aria-hidden
            className="inline-block h-5 min-w-16 rounded-sm bg-vh-gray-700/40"
          />
          <span
            aria-hidden
            className="inline-block h-5 min-w-12 rounded-sm bg-vh-gray-700/40"
          />
        </>
      ) : isAuthenticated ? (
        <>
          <Link href="/mypage" className={authTextLinkClassName}>
            마이페이지
          </Link>
          <span aria-hidden className="text-vh-gray-500">
            |
          </span>
          <button
            type="button"
            onClick={logout}
            className={authTextLinkClassName}
          >
            로그아웃
          </button>
        </>
      ) : (
        <>
          <Link href="/signup" className={authTextLinkClassName}>
            회원가입
          </Link>
          <span aria-hidden className="text-vh-gray-500">
            |
          </span>
          <Link href="/signin" className={authTextLinkClassName}>
            로그인
          </Link>
        </>
      )}
    </nav>
  );

  const sessionIcons = isAuthenticated ? (
    <div className="flex items-center gap-3">
      <button
        type="button"
        className={iconButtonClassName}
        aria-label="알림"
      >
        <Bell className="size-[30px]" strokeWidth={1.5} />
      </button>
      <button
        type="button"
        className={iconButtonClassName}
        aria-label="채팅"
      >
        <MessageCircle className="size-[30px]" strokeWidth={1.5} />
      </button>
    </div>
  ) : null;

  const searchPanel = (
    <div className="w-full">
      <form
        className="relative z-10 flex h-9 w-full items-center rounded-full border border-vh-gray-100/75 bg-vh-surface-charcoal px-4 shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_4px_16px_rgba(0,0,0,0.22)]"
        onSubmit={(e) => {
          e.preventDefault();
        }}
        role="search"
      >
        <HeaderSearchCategorySelect
          items={navItems}
          value={searchCategoryId}
          onChange={setSearchCategoryId}
        />
        <span aria-hidden className="mx-3 h-4 w-px bg-vh-gray-500/70" />
        <input
          type="search"
          name="q"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={HEADER_SEARCH_PLACEHOLDER}
          className="min-w-0 flex-1 bg-transparent font-sans text-[12px] text-vh-gray-100 outline-none placeholder:text-vh-gray-500"
          autoFocus
        />
        <button
          type="submit"
          className={cn(iconButtonClassName, "shrink-0")}
          aria-label="검색하기"
        >
          <Search className="size-4" strokeWidth={1.5} />
        </button>
      </form>
      <HeaderSuggestedSearches
        attached
        items={filteredSuggestions}
        title={trimmedQuery ? "연관검색어" : "추천검색어"}
        emptyMessage={`'${trimmedQuery}'와 일치하는 검색어가 없습니다.`}
        className="mt-1 border-vh-gray-500/70"
        onSelect={(term) => setSearchQuery(term)}
      />
    </div>
  );

  const logoLink = (
    <Link href="/" className="shrink-0" aria-label="Value Hub 홈">
      <SiteHeaderLogo />
    </Link>
  );

  return (
    <header className={cn("w-full shrink-0 bg-vh-surface-charcoal", className)}>
      <div className="mx-auto w-full max-w-[1240px] px-6 pb-4 pt-4 sm:px-8 md:px-10 md:pb-3 md:pt-4">
        <div className="relative flex flex-col gap-5">
          {searchOpen ? (
            <div
              ref={searchPanelRef}
              className="pointer-events-auto absolute left-1/2 top-0 z-20 w-full max-w-[430px] -translate-x-1/2 md:max-w-[460px] lg:max-w-[500px]"
            >
              {searchPanel}
            </div>
          ) : null}

          <div className="flex items-center justify-between gap-4">
            {logoLink}
            <div className="flex shrink-0 items-center gap-3">
              {!searchOpen ? (
                <button
                  type="button"
                  className={iconButtonClassName}
                  aria-label="검색 열기"
                  onClick={() => setSearchOpen(true)}
                >
                  <Search className="size-[30px]" strokeWidth={1.5} />
                </button>
              ) : null}
              {sessionIcons}
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <CategoryNavSlot items={navItems} />
            {authLinks}
          </div>
        </div>
      </div>
    </header>
  );
}
