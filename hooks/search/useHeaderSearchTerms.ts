"use client";

import { useEffect, useRef, useState } from "react";

import {
  getPopularSearchTermsAction,
  getRelatedSearchTermsAction,
  getSearchSuggestionsAction,
} from "@/actions/search";
import {
  SEARCH_SUGGESTIONS_MIN_LENGTH,
  SEARCH_TERMS_DEBOUNCE_MS,
} from "@/constants/search";

export type HeaderSearchPanelMode = "popular" | "related" | "suggestions";

function sameTermList(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  const left = [...a].map((t) => t.trim()).sort();
  const right = [...b].map((t) => t.trim()).sort();
  return left.every((term, i) => term === right[i]);
}

/** BE related 부족 시 popular fallback → FE에서는 연관 없음으로 취급 */
function hasDistinctRelated(related: string[], popular: string[]) {
  if (related.length === 0) return false;
  return !sameTermList(related, popular);
}

/**
 * 빈 입력 → 추천(popular).
 * 2글자 미만 → related 있으면 연관, 없으면 추천 유지.
 * 2글자 이상 → suggestions/related만. 없으면 패널용 terms 비움(아래 바 숨김).
 */
export function useHeaderSearchTerms(query: string) {
  const trimmed = query.trim();
  const [terms, setTerms] = useState<string[]>([]);
  const [mode, setMode] = useState<HeaderSearchPanelMode>("popular");
  const [loading, setLoading] = useState(false);
  const reqIdRef = useRef(0);
  const popularRef = useRef<string[]>([]);

  useEffect(() => {
    const reqId = ++reqIdRef.current;
    const timer = window.setTimeout(
      async () => {
        setLoading(true);
        try {
          if (!trimmed) {
            const result = await getPopularSearchTermsAction();
            if (reqId !== reqIdRef.current) return;
            const popular = result.ok ? result.data : [];
            popularRef.current = popular;
            setMode("popular");
            setTerms(popular);
            return;
          }

          const atLeastSuggestLen =
            trimmed.length >= SEARCH_SUGGESTIONS_MIN_LENGTH;

          // 2글자 이상: 로딩 중에도 추천 패널이 남지 않도록 먼저 숨김
          if (atLeastSuggestLen) {
            setTerms([]);
          }

          const popularPromise =
            popularRef.current.length > 0
              ? Promise.resolve(popularRef.current)
              : getPopularSearchTermsAction().then((r) => (r.ok ? r.data : []));

          const relatedPromise = getRelatedSearchTermsAction(trimmed);
          const suggestPromise = atLeastSuggestLen
            ? getSearchSuggestionsAction(trimmed)
            : Promise.resolve({ ok: true as const, data: [] as string[] });

          const [popular, relatedResult, suggestResult] = await Promise.all([
            popularPromise,
            relatedPromise,
            suggestPromise,
          ]);
          if (reqId !== reqIdRef.current) return;

          popularRef.current = popular;
          const suggestions = suggestResult.ok ? suggestResult.data : [];
          const related = relatedResult.ok ? relatedResult.data : [];

          if (suggestions.length > 0) {
            setMode("suggestions");
            setTerms(suggestions);
            return;
          }

          if (hasDistinctRelated(related, popular)) {
            setMode("related");
            setTerms(related);
            return;
          }

          if (atLeastSuggestLen) {
            // 연관 없음 → 아래 검색어 바 숨김
            setMode("related");
            setTerms([]);
            return;
          }

          // 1글자 등: 추천 유지
          setMode("popular");
          setTerms(popular);
        } finally {
          if (reqId === reqIdRef.current) setLoading(false);
        }
      },
      trimmed ? SEARCH_TERMS_DEBOUNCE_MS : 0
    );

    return () => window.clearTimeout(timer);
  }, [trimmed]);

  return { terms, mode, loading };
}
