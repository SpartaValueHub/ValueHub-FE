"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { Icon } from "@/components/atoms/icons";
import { BrandWordmark } from "@/components/molecules/brand/BrandWordmark";
import { HeaderAuthLinks } from "@/components/molecules/header/HeaderAuthLinks";
import { HeaderCategoryNav } from "@/components/molecules/header/HeaderCategoryNav";
import {
  HeaderSearchPanel,
  HeaderUtilityIcons,
} from "@/components/organisms/header/HeaderSearchPanel";
import { useAppSession } from "@/context/SessionContext";
import {
  PRODUCT_POSTS_PATH,
  headerCategoryNavIdFromUuid,
} from "@/constants/product-posts";
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
  const [searchOpen, setSearchOpen] = useState(false);
  const isHome = pathname === "/";
  const isDetail = isProductSubPath(pathname);
  const activeCategoryId =
    pathname === PRODUCT_POSTS_PATH
      ? headerCategoryNavIdFromUuid(searchParams.get("category"))
      : "all";

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 w-full",
        isHome ? "bg-[#323232]/70" : "bg-[#323232]"
      )}
    >
      <div
        className={cn(
          "relative mx-auto flex w-full max-w-[1440px] flex-col px-5 md:px-10",
          isDetail ? "gap-0 py-2.5 md:gap-5 md:py-5" : "gap-5 py-5"
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
            className="flex size-6 items-center justify-center text-vh-gray-100 md:hidden"
          >
            <Icon name="menu" size={24} />
          </button>

          <BrandWordmark size="md" className="hidden md:inline-flex" />

          <BrandWordmark
            size="sm"
            className={cn("md:hidden", searchOpen && "hidden")}
          />

          {searchOpen ? (
            <div className="absolute inset-x-10 top-5 z-10 hidden justify-center md:flex">
              <HeaderSearchPanel onClose={() => setSearchOpen(false)} />
            </div>
          ) : null}

          <HeaderUtilityIcons
            isAuthenticated={isAuthenticated}
            onSearchClick={() => setSearchOpen(true)}
            showSearch={!searchOpen}
            showInboxIcons={isAuthenticated}
            className="hidden md:flex"
          />

          {!searchOpen ? (
            <HeaderUtilityIcons
              isAuthenticated={isAuthenticated}
              onSearchClick={() => setSearchOpen(true)}
              showInboxIcons={false}
              className="md:hidden"
            />
          ) : (
            <span className="size-6 md:hidden" aria-hidden />
          )}
        </div>

        {searchOpen && !isDetail ? (
          <div className="md:hidden">
            <HeaderSearchPanel onClose={() => setSearchOpen(false)} />
          </div>
        ) : null}

        {!searchOpen && !isDetail ? (
          <div className="flex items-center justify-between gap-4">
            <HeaderCategoryNav
              activeId={activeCategoryId}
              size="sm"
              className="flex flex-1 justify-between overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] md:hidden [&::-webkit-scrollbar]:hidden"
            />

            <HeaderCategoryNav
              activeId={activeCategoryId}
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
            <HeaderCategoryNav activeId={activeCategoryId} />
            <HeaderAuthLinks
              isAuthenticated={isAuthenticated}
              isLoading={isLoading}
              onLogout={logout}
            />
          </div>
        ) : null}
      </div>
    </header>
  );
}
