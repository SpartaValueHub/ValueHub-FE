"use server";

/**
 * Search Server Actions.
 * 클라이언트는 이 Action만 호출 — lib/api·services 직접 import 금지.
 */
import { ApiError, ApiTimeoutError } from "@/lib/api/client";
import {
  getPopularSearchTermsService,
  getRelatedSearchTermsService,
  getSearchSuggestionsService,
} from "@/services/search.service";
import type { UiSearchTerms } from "@/types/search/ui";

export type SearchActionResult =
  { ok: true; data: UiSearchTerms } | { ok: false; message: string };

function toErrorMessage(e: unknown, fallback: string) {
  if (e instanceof ApiTimeoutError) {
    return "서버 응답이 지연되고 있습니다. 잠시 후 다시 시도해 주세요.";
  }
  if (e instanceof ApiError) return e.message;
  if (e instanceof Error) return e.message;
  return fallback;
}

export async function getPopularSearchTermsAction(): Promise<SearchActionResult> {
  try {
    const data = await getPopularSearchTermsService();
    return { ok: true, data };
  } catch (e) {
    return {
      ok: false,
      message: toErrorMessage(e, "추천 검색어를 불러오지 못했습니다."),
    };
  }
}

export async function getRelatedSearchTermsAction(
  q: string
): Promise<SearchActionResult> {
  try {
    const data = await getRelatedSearchTermsService(q);
    return { ok: true, data };
  } catch (e) {
    return {
      ok: false,
      message: toErrorMessage(e, "연관 검색어를 불러오지 못했습니다."),
    };
  }
}

export async function getSearchSuggestionsAction(
  q: string
): Promise<SearchActionResult> {
  try {
    const data = await getSearchSuggestionsService(q);
    return { ok: true, data };
  } catch (e) {
    return {
      ok: false,
      message: toErrorMessage(e, "검색 제안을 불러오지 못했습니다."),
    };
  }
}
