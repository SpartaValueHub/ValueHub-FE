"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { listChildCategoriesAction } from "@/actions/categories";
import { Icon } from "@/components/atoms/icons";
import { HeaderAuthLinks } from "@/components/molecules/header/HeaderAuthLinks";
import { MAIN_HEADER_NAV } from "@/constants/main-page";
import {
  headerCategoryNavHref,
  headerCategoryRootUuid,
  productPostsListHref,
} from "@/constants/product-posts";
import { cn } from "@/lib/utils";
import type { UiCategorySummary } from "@/types/categories/ui";

interface HeaderMobileMenuProps {
  open: boolean;
  isAuthenticated: boolean;
  isLoading?: boolean;
  onClose: () => void;
  onLogout?: () => void;
}

export function HeaderMobileMenu({
  open,
  isAuthenticated,
  isLoading,
  onClose,
  onLogout,
}: HeaderMobileMenuProps) {
  const [expandedId, setExpandedId] = useState<string | null>("luxury");
  const [childrenById, setChildrenById] = useState<
    Record<string, UiCategorySummary[]>
  >({});

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

  useEffect(() => {
    if (!open || !expandedId) return;
    const rootUuid = headerCategoryRootUuid(expandedId);
    if (!rootUuid || expandedId in childrenById) return;

    let cancelled = false;
    listChildCategoriesAction(rootUuid).then((result) => {
      if (cancelled) return;
      setChildrenById((prev) => ({
        ...prev,
        [expandedId]: result.ok ? result.data : [],
      }));
    });

    return () => {
      cancelled = true;
    };
  }, [open, expandedId, childrenById]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] md:hidden">
      <button
        type="button"
        aria-label="메뉴 닫기"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      <nav
        aria-label="모바일 메뉴"
        className="relative flex h-full w-[80%] flex-col justify-between bg-[#d0d0d0] px-5 pb-[30px] pt-[60px] animate-in slide-in-from-left duration-300"
      >
        <div className="flex flex-col items-start gap-[18px]">
          <p className="font-sans text-xs font-medium leading-[1.4] text-black">
            카테고리
          </p>

          {MAIN_HEADER_NAV.map((item) => {
            const href = headerCategoryNavHref(item.id);
            const expandable = item.id !== "all";
            const expanded = expandable && expandedId === item.id;
            const children = childrenById[item.id] ?? [];
            const rootUuid = headerCategoryRootUuid(item.id);

            return (
              <div key={item.id} className="flex w-full flex-col gap-5">
                <div className="flex items-center gap-1">
                  <Link
                    href={href}
                    onClick={onClose}
                    className="font-sans text-base leading-[1.4] text-black"
                  >
                    {item.title.toUpperCase()}
                  </Link>
                  {expandable ? (
                    <button
                      type="button"
                      aria-expanded={expanded}
                      aria-label={`${item.title} 하위 카테고리`}
                      className="flex size-[22px] items-center justify-center text-black"
                      onClick={() =>
                        setExpandedId((current) =>
                          current === item.id ? null : item.id
                        )
                      }
                    >
                      <Icon
                        name="chevron-down"
                        size={22}
                        className={cn(
                          "transition-transform",
                          expanded && "rotate-180"
                        )}
                      />
                    </button>
                  ) : null}
                </div>

                {expanded && rootUuid ? (
                  <div className="flex flex-col items-start gap-5 px-3 font-sans text-sm leading-[1.4] text-[#323232]">
                    <Link
                      href={headerCategoryNavHref(item.id)}
                      onClick={onClose}
                    >
                      전체상품
                    </Link>
                    {children.map((child) => (
                      <Link
                        key={child.categoryUuid}
                        href={productPostsListHref({
                          category: rootUuid,
                          sub: child.categoryUuid,
                        })}
                        onClick={onClose}
                      >
                        {child.categoryName}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        <HeaderAuthLinks
          variant="menu"
          isAuthenticated={isAuthenticated}
          isLoading={isLoading}
          onLogout={onLogout}
          onNavigate={onClose}
        />
      </nav>

      <button
        type="button"
        aria-label="메뉴 닫기"
        className="absolute top-10 left-[80%] flex items-center p-[17px] text-white"
        onClick={onClose}
      >
        <Icon name="close" size={17} className="brightness-0 invert" />
      </button>
    </div>
  );
}
