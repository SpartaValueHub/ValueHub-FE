import { apiFetch, getCategoryApiUrl } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type { ApiCategorySummary } from "@/types/categories/api";

/** category-service HTTP — lib/api/* 전용. UI·actions에서 import 금지. */

function categoryFetch<T>(path: string) {
  return apiFetch<T>(path, {
    method: "GET",
    baseUrl: getCategoryApiUrl(),
    cache: { noStore: true },
    skipSessionRecovery: true,
  });
}

/** parentUuid 없으면 최상위(대분류) 목록 */
export function listCategoryChildren(parentUuid?: string) {
  return categoryFetch<ApiCategorySummary[]>(
    API_ENDPOINTS.categories.children(parentUuid)
  );
}

/** FO 활성 리프. parentUuid 있으면 해당 하위 트리만 */
export function listCategoryLeaves(parentUuid?: string) {
  return categoryFetch<ApiCategorySummary[]>(
    API_ENDPOINTS.categories.leaves(parentUuid)
  );
}
