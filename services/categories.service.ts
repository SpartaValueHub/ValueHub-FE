/**
 * category-service 오케스트레이션.
 * UI/actions → service → lib/api (3-layer).
 */
import {
  listCategoryChildren,
  listCategoryLeaves,
} from "@/lib/api/categories";
import type { ApiCategorySummary } from "@/types/categories/api";
import type { UiCategorySummary } from "@/types/categories/ui";

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

/**
 * categoryUuid로 경로 문자열 생성.
 * 리프/중분류 → "대분류 > 중분류", 대분류 → "대분류명".
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

      for (const mid of children) {
        const leaves = await listLeafCategoriesService(mid.categoryUuid);
        if (leaves.some((leaf) => leaf.categoryUuid === categoryUuid)) {
          return `${root.categoryName} > ${mid.categoryName}`;
        }
      }
    }
    return categoryUuid;
  } catch {
    return categoryUuid;
  }
}

/** 등록/수정 폼용 — 저장된 리프(또는 중분류=리프) UUID → 대·중·브랜드 선택값 */
export type UiCategoryFormSelection = {
  rootUuid: string;
  midUuid: string;
  /** 브랜드 리프. 중분류가 곧 리프면 빈 문자열 */
  brandUuid: string;
};

export async function resolveCategoryFormSelection(
  categoryUuid: string
): Promise<UiCategoryFormSelection | null> {
  try {
    const roots = await listRootCategoriesService();
    for (const root of roots) {
      const children = await listChildCategoriesService(root.categoryUuid);
      const midExact = children.find((c) => c.categoryUuid === categoryUuid);
      if (midExact) {
        return {
          rootUuid: root.categoryUuid,
          midUuid: midExact.categoryUuid,
          brandUuid: "",
        };
      }

      for (const mid of children) {
        const leaves = await listLeafCategoriesService(mid.categoryUuid);
        if (leaves.some((leaf) => leaf.categoryUuid === categoryUuid)) {
          return {
            rootUuid: root.categoryUuid,
            midUuid: mid.categoryUuid,
            brandUuid: categoryUuid,
          };
        }
      }
    }
  } catch {
    /* fall through */
  }
  return null;
}

/** 상세 「동네 추천」용 — 같은 중분류 하위 리프 UUID (없으면 자기 UUID) */
export async function listSiblingLeafCategoryUuids(
  categoryUuid: string
): Promise<string[]> {
  try {
    const roots = await listRootCategoriesService();
    for (const root of roots) {
      if (root.categoryUuid === categoryUuid) {
        const mids = await listChildCategoriesService(root.categoryUuid);
        const leaves = (
          await Promise.all(
            mids.map((mid) => listLeafCategoriesService(mid.categoryUuid))
          )
        ).flat();
        return leaves.map((l) => l.categoryUuid);
      }

      const children = await listChildCategoriesService(root.categoryUuid);
      const mid = children.find((c) => c.categoryUuid === categoryUuid);
      if (mid) {
        const leaves = await listLeafCategoriesService(mid.categoryUuid);
        return leaves.map((l) => l.categoryUuid);
      }

      for (const child of children) {
        const leaves = await listLeafCategoriesService(child.categoryUuid);
        if (leaves.some((leaf) => leaf.categoryUuid === categoryUuid)) {
          return leaves.map((l) => l.categoryUuid);
        }
      }
    }
  } catch {
    /* fall through */
  }
  return [categoryUuid];
}
