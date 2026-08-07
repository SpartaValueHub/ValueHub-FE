import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { apiFetch, getMemberApiUrl } from "@/lib/api/client";
import type { ApiActiveTerm } from "@/types/terms/api";

const ACTIVE_TERMS_REVALIDATE_SECONDS = 60 * 60 * 24 * 30;

export async function listActiveTerms(): Promise<ApiActiveTerm[]> {
  return apiFetch<ApiActiveTerm[]>(API_ENDPOINTS.terms.active, {
    baseUrl: getMemberApiUrl(),
    skipSessionRecovery: true,
    cache: {
      tags: ["active-terms-v2"],
      revalidate: ACTIVE_TERMS_REVALIDATE_SECONDS,
    },
  });
}
