/**
 * 헤더 검색어(popular / related / suggestions) 오케스트레이션.
 */
import {
  getPopularSearchTerms,
  getRelatedSearchTerms,
  getSearchSuggestions,
} from "@/lib/api/search";
import type { UiSearchTerms } from "@/types/search/ui";

function mapTerms(terms: string[] | undefined): UiSearchTerms {
  if (!Array.isArray(terms)) return [];
  return terms.filter((t) => typeof t === "string" && t.trim().length > 0);
}

export async function getPopularSearchTermsService(): Promise<UiSearchTerms> {
  const api = await getPopularSearchTerms();
  return mapTerms(api.terms);
}

export async function getRelatedSearchTermsService(
  q: string
): Promise<UiSearchTerms> {
  const trimmed = q.trim();
  if (!trimmed) return [];
  const api = await getRelatedSearchTerms(trimmed);
  return mapTerms(api.terms);
}

export async function getSearchSuggestionsService(
  q: string
): Promise<UiSearchTerms> {
  const trimmed = q.trim();
  if (trimmed.length < 2) return [];
  const api = await getSearchSuggestions(trimmed);
  return mapTerms(api.terms);
}
