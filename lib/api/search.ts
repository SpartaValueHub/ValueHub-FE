import { apiFetch, getProductPostApiUrl } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type { ApiSearchTermsResponse } from "@/types/search/api";

/** search HTTP — lib/api/* 전용. UI·actions에서 import 금지. */

function searchFetch(path: string) {
  return apiFetch<ApiSearchTermsResponse>(path, {
    method: "GET",
    baseUrl: getProductPostApiUrl(),
    cache: { noStore: true },
    skipSessionRecovery: true,
  });
}

/** GET /api/v1/search/popular */
export function getPopularSearchTerms() {
  return searchFetch(API_ENDPOINTS.search.popular);
}

/** GET /api/v1/search/related?q= */
export function getRelatedSearchTerms(q: string) {
  return searchFetch(API_ENDPOINTS.search.related(q));
}

/** GET /api/v1/search/suggestions?q= */
export function getSearchSuggestions(q: string) {
  return searchFetch(API_ENDPOINTS.search.suggestions(q));
}
