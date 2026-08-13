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
