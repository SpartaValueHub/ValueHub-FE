"use client";

import { useCallback, useState } from "react";

import type { ApiActiveTerm } from "@/types/terms/api";

const STALE_TIME_MS = 30 * 60 * 1000;

type CacheEntry = {
  data: ApiActiveTerm[];
  fetchedAt: number;
};

let memoryCache: CacheEntry | null = null;
let inflight: Promise<ApiActiveTerm[]> | null = null;

async function fetchActiveTermsFromApi(): Promise<ApiActiveTerm[]> {
  const response = await fetch("/api/terms/active");
  if (!response.ok) {
    throw new Error("약관을 불러오지 못했습니다.");
  }
  return response.json() as Promise<ApiActiveTerm[]>;
}

export function getActiveTermsQuery(): Promise<ApiActiveTerm[]> {
  if (memoryCache && Date.now() - memoryCache.fetchedAt < STALE_TIME_MS) {
    return Promise.resolve(memoryCache.data);
  }

  if (!inflight) {
    inflight = fetchActiveTermsFromApi()
      .then((data) => {
        memoryCache = { data, fetchedAt: Date.now() };
        return data;
      })
      .finally(() => {
        inflight = null;
      });
  }

  return inflight;
}

export function useActiveTerms() {
  const [terms, setTerms] = useState<ApiActiveTerm[] | null>(
    memoryCache?.data ?? null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (memoryCache && Date.now() - memoryCache.fetchedAt < STALE_TIME_MS) {
      setTerms(memoryCache.data);
      setError(null);
      return memoryCache.data;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await getActiveTermsQuery();
      setTerms(data);
      return data;
    } catch {
      setError("약관을 불러오지 못했습니다.");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { terms, isLoading, error, load };
}
