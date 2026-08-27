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

/**
 * 빈 입력 → 추천(popular).
 * 입력 있음 → 연관(related).
 * 2글자 이상이면 자동완성(suggestions) 우선, 비면 연관 fallback.
 */
export function useHeaderSearchTerms(query: string) {
  const trimmed = query.trim();
  const [terms, setTerms] = useState<string[]>([]);
  const [mode, setMode] = useState<HeaderSearchPanelMode>("popular");
  const [loading, setLoading] = useState(false);
  const reqIdRef = useRef(0);

  useEffect(() => {
    const reqId = ++reqIdRef.current;
    const timer = window.setTimeout(
      async () => {
        setLoading(true);
        try {
          if (!trimmed) {
            const result = await getPopularSearchTermsAction();
            if (reqId !== reqIdRef.current) return;
            setMode("popular");
            setTerms(result.ok ? result.data : []);
            return;
          }

          if (trimmed.length >= SEARCH_SUGGESTIONS_MIN_LENGTH) {
            const [suggestResult, relatedResult] = await Promise.all([
              getSearchSuggestionsAction(trimmed),
              getRelatedSearchTermsAction(trimmed),
            ]);
            if (reqId !== reqIdRef.current) return;
            const suggestions = suggestResult.ok ? suggestResult.data : [];
            if (suggestions.length > 0) {
              setMode("suggestions");
              setTerms(suggestions);
              return;
            }
            setMode("related");
            setTerms(relatedResult.ok ? relatedResult.data : []);
            return;
          }

          const relatedResult = await getRelatedSearchTermsAction(trimmed);
          if (reqId !== reqIdRef.current) return;
          setMode("related");
          setTerms(relatedResult.ok ? relatedResult.data : []);
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
