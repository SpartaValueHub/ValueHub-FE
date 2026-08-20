"use client";

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
import { cn } from "@/lib/utils";

export function Header() {
  const { isAuthenticated, isLoading, logout } = useAppSession();
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState("all");

  return (
    <header className="fixed inset-x-0 top-0 z-50 w-full bg-[#323232]">
      <div className="relative mx-auto flex w-full max-w-[1440px] flex-col gap-5 px-5 py-5 md:px-10">
        <div className="flex min-h-[52px] items-center justify-between">
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

        {searchOpen ? (
          <div className="md:hidden">
            <HeaderSearchPanel onClose={() => setSearchOpen(false)} />
          </div>
        ) : null}

        {!searchOpen ? (
          <div className="flex items-center justify-between gap-4">
            <HeaderCategoryNav
              activeId={activeCategoryId}
              onNavigate={setActiveCategoryId}
              size="sm"
              className="flex flex-1 justify-between overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] md:hidden [&::-webkit-scrollbar]:hidden"
            />

            <HeaderCategoryNav
              activeId={activeCategoryId}
              onNavigate={setActiveCategoryId}
              className="hidden flex-1 md:flex"
            />

            <HeaderAuthLinks
              isAuthenticated={isAuthenticated}
              isLoading={isLoading}
              onLogout={logout}
              className="hidden shrink-0 md:flex"
            />
          </div>
        ) : (
          <div className="hidden items-center justify-between md:flex">
            <HeaderCategoryNav
              activeId={activeCategoryId}
              onNavigate={setActiveCategoryId}
            />
            <HeaderAuthLinks
              isAuthenticated={isAuthenticated}
              isLoading={isLoading}
              onLogout={logout}
            />
          </div>
        )}
      </div>
    </header>
  );
}
