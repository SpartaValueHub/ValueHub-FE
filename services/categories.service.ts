/**
 * category-service 오케스트레이션.
 * UI/actions → service → lib/api (3-layer).
 */
import {
  listCategoryChildren,
  listCategoryLeaves,
} from "@/lib/api/categories";
import type { ApiCategorySummary } from "@/types/categories/api";
import type {
  UiCategoryNavItem,
  UiCategorySummary,
} from "@/types/categories/ui";
import {
  ALL_CATEGORY_NAV_ID,
  ALL_CATEGORY_NAV_LABEL,
  HEADER_ROOT_CATEGORY_FALLBACK,
} from "@/constants/categories";

export function mapCategorySummary(
  api: ApiCategorySummary
): UiCategorySummary {
  return {
    categoryUuid: api.categoryUuid,
    categoryName: api.categoryName,
    parentUuid: api.parentUuid,
    sortOrder: api.sortOrder,
    depth: api.depth,
    active: api.active,
  };
}

export async function listRootCategoriesService(): Promise<
  UiCategorySummary[]
> {
  const list = await listCategoryChildren();
  return list.map(mapCategorySummary);
}

export async function listChildCategoriesService(
  parentUuid: string
): Promise<UiCategorySummary[]> {
  const list = await listCategoryChildren(parentUuid);
  return list.map(mapCategorySummary);
}

export async function listLeafCategoriesService(
  parentUuid?: string
): Promise<UiCategorySummary[]> {
  const list = await listCategoryLeaves(parentUuid);
  return list.map(mapCategorySummary);
}

/** 헤더용: FE All + 활성 대분류 (BE sortOrder 유지) */
export function buildHeaderCategoryNavItems(
  roots: UiCategorySummary[]
): UiCategoryNavItem[] {
  const allItem: UiCategoryNavItem = {
    id: ALL_CATEGORY_NAV_ID,
    label: ALL_CATEGORY_NAV_LABEL,
    categoryUuid: null,
  };

  const categoryItems = roots
    .filter((c) => c.active)
    .map((c) => ({
      id: c.categoryUuid,
      label: c.categoryName,
      categoryUuid: c.categoryUuid,
    }));

  return [allItem, ...categoryItems];
}

/**
 * categoryUuid로 카테고리 경로 문자열 생성.
 * 리프이면 "대분류 > 리프명", 대분류이면 "대분류명".
 * API 실패 시 UUID 그대로 반환.
 */
export async function getCategoryPathService(
  categoryUuid: string
): Promise<string> {
  try {
    const roots = await listRootCategoriesService();
    const rootMatch = roots.find((r) => r.categoryUuid === categoryUuid);
    if (rootMatch) return rootMatch.categoryName;

    for (const root of roots) {
      const children = await listChildCategoriesService(root.categoryUuid);
      const childMatch = children.find(
        (c) => c.categoryUuid === categoryUuid
      );
      if (childMatch) {
        return `${root.categoryName} > ${childMatch.categoryName}`;
      }
    }
    return categoryUuid;
  } catch {
    return categoryUuid;
  }
}

export async function loadHeaderCategoryNavService(): Promise<
  UiCategoryNavItem[]
> {
  try {
    const roots = await listRootCategoriesService();
    const items = buildHeaderCategoryNavItems(roots);
    if (items.length <= 1) {
      return HEADER_ROOT_CATEGORY_FALLBACK;
    }
    return items;
  } catch {
    return HEADER_ROOT_CATEGORY_FALLBACK;
  }
}
