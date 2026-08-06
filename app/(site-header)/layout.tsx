import { SiteHeader } from "@/components/templates/SiteHeader";
import {
  ALL_CATEGORY_NAV_ID,
  ALL_CATEGORY_NAV_LABEL,
} from "@/constants/categories";
import {
  buildHeaderCategoryNavItems,
  listRootCategoriesService,
} from "@/services/categories.service";
import type { UiCategoryNavItem } from "@/types/categories/ui";

async function loadHeaderCategoryNav(): Promise<UiCategoryNavItem[]> {
  try {
    const roots = await listRootCategoriesService();
    return buildHeaderCategoryNavItems(roots);
  } catch {
    return [
      {
        id: ALL_CATEGORY_NAV_ID,
        label: ALL_CATEGORY_NAV_LABEL,
        categoryUuid: null,
      },
    ];
  }
}

/** Listing 등 — 카테고리 포함 Site Header (메인 홈과 분리) */
export default async function SiteHeaderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categoryNavItems = await loadHeaderCategoryNav();

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-vh-surface-charcoal">
      <SiteHeader categoryNavItems={categoryNavItems} />
      {children}
    </div>
  );
}
