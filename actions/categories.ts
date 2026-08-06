"use server";

/**
 * Category 조회 Server Actions.
 * 클라이언트는 이 Action만 호출 — lib/api·services 직접 import 금지.
 */
import { ApiError } from "@/lib/api/client";
import {
  buildHeaderCategoryNavItems,
  listChildCategoriesService,
  listLeafCategoriesService,
  listRootCategoriesService,
} from "@/services/categories.service";
import type {
  UiCategoryNavItem,
  UiCategorySummary,
} from "@/types/categories/ui";

export type CategoriesActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; message: string };

function toErrorMessage(e: unknown, fallback: string) {
  if (e instanceof ApiError) return e.message;
  if (e instanceof Error) return e.message;
  return fallback;
}

export async function listRootCategoriesAction(): Promise<
  CategoriesActionResult<UiCategorySummary[]>
> {
  try {
    const data = await listRootCategoriesService();
    return { ok: true, data };
  } catch (e) {
    return {
      ok: false,
      message: toErrorMessage(e, "카테고리를 불러오지 못했습니다."),
    };
  }
}

export async function listHeaderCategoryNavAction(): Promise<
  CategoriesActionResult<UiCategoryNavItem[]>
> {
  try {
    const roots = await listRootCategoriesService();
    return { ok: true, data: buildHeaderCategoryNavItems(roots) };
  } catch (e) {
    return {
      ok: false,
      message: toErrorMessage(e, "카테고리를 불러오지 못했습니다."),
    };
  }
}

export async function listChildCategoriesAction(
  parentUuid: string
): Promise<CategoriesActionResult<UiCategorySummary[]>> {
  try {
    const data = await listChildCategoriesService(parentUuid);
    return { ok: true, data };
  } catch (e) {
    return {
      ok: false,
      message: toErrorMessage(e, "하위 카테고리를 불러오지 못했습니다."),
    };
  }
}

export async function listLeafCategoriesAction(
  parentUuid?: string
): Promise<CategoriesActionResult<UiCategorySummary[]>> {
  try {
    const data = await listLeafCategoriesService(parentUuid);
    return { ok: true, data };
  } catch (e) {
    return {
      ok: false,
      message: toErrorMessage(e, "브랜드(리프) 목록을 불러오지 못했습니다."),
    };
  }
}
