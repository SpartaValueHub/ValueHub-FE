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

import { BrandLogoIcon } from "@/components/molecules/BrandLogoIcon";
import { HeaderCategoryNav } from "@/components/molecules/HeaderCategoryNav";
import { HeaderSearchCategorySelect } from "@/components/molecules/HeaderSearchCategorySelect";
import { useAppSession } from "@/context/SessionContext";
import {
  ALL_CATEGORY_NAV_ID,
  ALL_CATEGORY_NAV_LABEL,
} from "@/constants/categories";
import { cn } from "@/lib/utils";
import type { UiCategoryNavItem } from "@/types/categories/ui";

const fallbackNavItems: UiCategoryNavItem[] = [
  {
    id: ALL_CATEGORY_NAV_ID,
    label: ALL_CATEGORY_NAV_LABEL,
    categoryUuid: null,
  },
];

const authLinkClassName =
  "font-sans text-sm text-vh-gray-100 transition-colors hover:text-vh-brand-gold";

const iconButtonClassName =
  "rounded-sm p-1 text-vh-gray-100 transition-colors hover:text-vh-brand-gold";

interface SiteHeaderProps {
  categoryNavItems?: UiCategoryNavItem[];
  className?: string;
}

/** Listing 등용 사이트 헤더 — 메인 홈의 Header(팀원)와 분리 */
export function SiteHeader({
  categoryNavItems = fallbackNavItems,
  className,
}: SiteHeaderProps) {
  const { isAuthenticated, isLoading, logout } = useAppSession();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchCategoryId, setSearchCategoryId] =
    useState<string>(ALL_CATEGORY_NAV_ID);
  const searchPanelRef = useRef<HTMLDivElement>(null);
  const navItems =
    categoryNavItems.length > 0 ? categoryNavItems : fallbackNavItems;

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
    <nav className="flex shrink-0 items-center gap-2 self-center">
      {isLoading ? (
        <>
          <span
            aria-hidden
            className="inline-block h-5 min-w-14 rounded-sm bg-vh-gray-700/40"
          />
          <span aria-hidden className="text-vh-gray-500">
            |
          </span>
          <span
            aria-hidden
            className="inline-block h-5 min-w-14 rounded-sm bg-vh-gray-700/40"
          />
        </>
      ) : isAuthenticated ? (
        <>
          <Link href="/mypage" className={authLinkClassName}>
            마이페이지
          </Link>
          <span aria-hidden className="text-vh-gray-500">
            |
          </span>
          <button type="button" onClick={logout} className={authLinkClassName}>
            로그아웃
          </button>
        </>
      ) : (
        <>
          <Link href="/signup" className={authLinkClassName}>
            회원가입
          </Link>
          <span aria-hidden className="text-vh-gray-500">
            |
          </span>
          <Link href="/signin" className={authLinkClassName}>
            로그인
          </Link>
        </>
      )}
    </nav>
  );

  return (
    <header
      className={cn("w-full shrink-0 bg-vh-surface-charcoal", className)}
    >
      <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-5 px-5 pb-5 pt-5 sm:px-8 md:gap-6 md:px-10 md:pt-7">
        {/* 1행: 로고 | 검색(+ 로그인 시 알림·채팅) */}
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="shrink-0" aria-label="Value Hub 홈">
            <BrandLogoIcon size="md" className="size-9 md:size-10" />
          </Link>

          <div
            ref={searchPanelRef}
            className="flex min-w-0 flex-1 items-center justify-end gap-3 md:gap-4"
          >
            {searchOpen ? (
              <form
                className="flex h-10 min-w-0 max-w-xl flex-1 items-center rounded-full border border-vh-gray-500/60 bg-transparent px-4"
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
                <span
                  aria-hidden
                  className="mx-3 h-4 w-px bg-vh-gray-500/70"
                />
                <input
                  type="search"
                  name="q"
                  placeholder="검색어를 입력하세요."
                  className="min-w-0 flex-1 bg-transparent font-sans text-sm text-vh-gray-100 outline-none placeholder:text-vh-gray-500"
                  autoFocus
                />
                <input type="hidden" name="category" value={searchCategoryId} />
                <button
                  type="submit"
                  className={cn(iconButtonClassName, "shrink-0")}
                  aria-label="검색하기"
                >
                  <Search className="size-4" strokeWidth={1.5} />
                </button>
              </form>
            ) : (
              <button
                type="button"
                className={iconButtonClassName}
                aria-label="검색 열기"
                onClick={() => setSearchOpen(true)}
              >
                <Search className="size-5" strokeWidth={1.5} />
              </button>
            )}

            {isAuthenticated ? (
              <>
                <button
                  type="button"
                  className={iconButtonClassName}
                  aria-label="알림"
                >
                  <Bell className="size-5" strokeWidth={1.5} />
                </button>
                <button
                  type="button"
                  className={iconButtonClassName}
                  aria-label="채팅"
                >
                  <MessageCircle className="size-5" strokeWidth={1.5} />
                </button>
              </>
            ) : null}
          </div>
        </div>

        {/* 2행: 카테고리 | 회원가입·로그인 또는 마이페이지·로그아웃 (같은 라인) */}
        <div className="flex items-center justify-between gap-4 md:gap-8">
          <Suspense
            fallback={
              <ul className="flex min-w-0 flex-1 flex-wrap gap-x-8 md:gap-x-12 lg:gap-x-14">
                {navItems.map((item) => (
                  <li
                    key={item.id}
                    className="font-serif text-sm text-vh-gray-500 md:text-[15px]"
                  >
                    {item.label}
                  </li>
                ))}
              </ul>
            }
          >
            <HeaderCategoryNav items={navItems} />
          </Suspense>
          {authLinks}
        </div>
      </div>
    </header>
  );
}
