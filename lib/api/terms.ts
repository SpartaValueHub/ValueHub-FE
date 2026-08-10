import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { apiFetch, getMemberApiUrl } from "@/lib/api/client";
import type { ApiActiveTerm } from "@/types/terms/api";

export async function listActiveTerms(): Promise<ApiActiveTerm[]> {
  return apiFetch<ApiActiveTerm[]>(API_ENDPOINTS.terms.active, {
    baseUrl: getMemberApiUrl(),
    skipSessionRecovery: true,
    cache: { noStore: true },
  });
}
