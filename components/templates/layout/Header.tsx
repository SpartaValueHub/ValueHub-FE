"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Icon } from "@/components/atoms/icons";
import { BrandWordmark } from "@/components/molecules/brand/BrandWordmark";
import { HeaderAuthLinks } from "@/components/molecules/header/HeaderAuthLinks";
import { HeaderCategoryNav } from "@/components/molecules/header/HeaderCategoryNav";
import { HeaderMobileMenu } from "@/components/organisms/header/HeaderMobileMenu";
import { HeaderMobileSearch } from "@/components/organisms/header/HeaderMobileSearch";
import {
  HeaderSearchPanel,
  HeaderUtilityIcons,
} from "@/components/organisms/header/HeaderSearchPanel";
import { useAppSession } from "@/context/SessionContext";
import {
  PRODUCT_POSTS_PATH,
  headerCategoryNavIdFromUuid,
} from "@/constants/product-posts";
import { useChatUnreadCount } from "@/hooks/chat/useChatUnreadCount";
import { cn } from "@/lib/utils";

function isProductSubPath(pathname: string) {
  return (
    pathname.startsWith(`${PRODUCT_POSTS_PATH}/`) &&
    pathname !== PRODUCT_POSTS_PATH
  );
}

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading, logout } = useAppSession();
  const chatCount = useChatUnreadCount(isAuthenticated);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const desktopSearchRef = useRef<HTMLDivElement>(null);
  const searchQuery = searchParams.toString();
  const routeKey = `${pathname}?${searchQuery}`;
  const [overlayRouteKey, setOverlayRouteKey] = useState(routeKey);
  const isHome = pathname === "/";
  const isDetail = isProductSubPath(pathname);
  /** Figma product_list 모바일 헤더는 햄버거·로고·검색만 (대분류 내비 없음) */
  const isProductList = pathname === PRODUCT_POSTS_PATH;
  const activeCategoryId =
    pathname === PRODUCT_POSTS_PATH
      ? headerCategoryNavIdFromUuid(searchParams.get("category"))
      : "all";

  /** 라우트·쿼리 이동 시 검색·메뉴 정리 (카테고리 Link 포함) */
  if (overlayRouteKey !== routeKey) {
    setOverlayRouteKey(routeKey);
    setSearchOpen(false);
    setMobileSearchOpen(false);
    setMenuOpen(false);
  }

  function closeDesktopSearch() {
    setSearchOpen(false);
  }

  function closeAllOverlays() {
    setSearchOpen(false);
    setMobileSearchOpen(false);
    setMenuOpen(false);
  }

  /** PC 검색 — Esc / 패널 바깥 클릭으로 닫기 (검색 아이콘 토글은 제외) */
  useEffect(() => {
    if (!searchOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDesktopSearch();
    };

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (desktopSearchRef.current?.contains(target)) return;
      if (
        target instanceof Element &&
        target.closest("[data-header-search-toggle]")
      ) {
        return;
      }
      closeDesktopSearch();
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [searchOpen]);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 w-full",
          isHome ? "bg-[#323232]/70" : "bg-[#323232]"
        )}
      >
        <div
          className={cn(
            "relative mx-auto flex w-full max-w-[1440px] flex-col px-5 md:px-10",
            isDetail
              ? "gap-0 py-2.5 md:gap-5 md:py-5"
              : isProductList
                ? "gap-0 py-2.5 md:gap-5 md:py-5"
                : "gap-5 py-5"
          )}
        >
          {/* 모바일 상세 — 뒤로가기 | Value hub (돋보기 없음, 균형용 spacer) */}
          {isDetail ? (
            <div className="grid grid-cols-[24px_1fr_24px] items-center md:hidden">
              <button
                type="button"
                aria-label="뒤로 가기"
                className="flex size-6 items-center justify-center text-vh-gray-100"
                onClick={() => router.back()}
              >
                <Icon name="chevron-left" size={24} />
              </button>
              <BrandWordmark
                size="sm"
                className="justify-self-center leading-none"
              />
              <span className="size-6" aria-hidden />
            </div>
          ) : null}

          <div
            className={cn(
              "min-h-[52px] items-center justify-between",
              isDetail ? "hidden md:flex" : "flex"
            )}
          >
            <button
              type="button"
              aria-label="메뉴 열기"
              aria-expanded={menuOpen}
              className="flex size-6 items-center justify-center text-vh-gray-100 md:hidden"
              onClick={() => {
                setSearchOpen(false);
                setMobileSearchOpen(false);
                setMenuOpen(true);
              }}
            >
              <Icon name="menu" size={24} />
            </button>

            <BrandWordmark size="md" className="hidden md:inline-flex" />

            <BrandWordmark size="sm" className="md:hidden" />

            {searchOpen ? (
              <div
                ref={desktopSearchRef}
                className="absolute inset-x-10 top-5 z-10 hidden justify-center md:flex"
              >
                <HeaderSearchPanel onClose={closeDesktopSearch} />
              </div>
            ) : null}

            <HeaderUtilityIcons
              isAuthenticated={isAuthenticated}
              chatCount={chatCount}
              onSearchClick={() => {
                setMenuOpen(false);
                setMobileSearchOpen(false);
                setSearchOpen((open) => !open);
              }}
              showSearch
              showInboxIcons={isAuthenticated}
              className="hidden md:flex"
            />

            <HeaderUtilityIcons
              isAuthenticated={isAuthenticated}
              onSearchClick={() => {
                setMenuOpen(false);
                setSearchOpen(false);
                setMobileSearchOpen(true);
              }}
              showInboxIcons={false}
              className="md:hidden"
            />
          </div>

          {!searchOpen && !isDetail ? (
            <div
              className={cn(
                "items-center justify-between gap-4",
                isProductList ? "hidden md:flex" : "flex"
              )}
            >
              <HeaderCategoryNav
                activeId={activeCategoryId}
                size="sm"
                onNavigate={closeAllOverlays}
                className="flex flex-1 justify-between overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] md:hidden [&::-webkit-scrollbar]:hidden"
              />

              <HeaderCategoryNav
                activeId={activeCategoryId}
                onNavigate={closeAllOverlays}
                className="hidden flex-1 md:flex"
              />

              <HeaderAuthLinks
                isAuthenticated={isAuthenticated}
                isLoading={isLoading}
                onLogout={logout}
                className="hidden shrink-0 md:flex"
              />
            </div>
          ) : null}

          {!searchOpen && isDetail ? (
            <div className="hidden items-center justify-between gap-4 md:flex">
              <HeaderCategoryNav
                activeId={activeCategoryId}
                onNavigate={closeAllOverlays}
                className="flex flex-1"
              />
              <HeaderAuthLinks
                isAuthenticated={isAuthenticated}
                isLoading={isLoading}
                onLogout={logout}
                className="shrink-0"
              />
            </div>
          ) : null}

          {searchOpen ? (
            <div className="hidden items-center justify-between md:flex">
              <HeaderCategoryNav
                activeId={activeCategoryId}
                onNavigate={closeAllOverlays}
              />
              <HeaderAuthLinks
                isAuthenticated={isAuthenticated}
                isLoading={isLoading}
                onLogout={logout}
              />
            </div>
          ) : null}
        </div>
      </header>

      <HeaderMobileMenu
        open={menuOpen}
        isAuthenticated={isAuthenticated}
        isLoading={isLoading}
        onClose={() => setMenuOpen(false)}
        onLogout={() => {
          setMenuOpen(false);
          logout();
        }}
      />
      <HeaderMobileSearch
        open={mobileSearchOpen}
        onClose={() => setMobileSearchOpen(false)}
      />
    </>
  );
}
