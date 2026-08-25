import { apiFetch, getMemberRegionsApiUrl } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type {
  ApiAddMemberRegionRequest,
  ApiChangeMemberRegionRequest,
  ApiMemberRegion,
  ApiVerifyMemberRegionRequest,
} from "@/types/member-regions/api";

/** member-regions-service HTTP — lib/api/* 전용 */

function regionsFetch<T>(
  path: string,
  init?: {
    method?: string;
    body?: unknown;
  }
) {
  return apiFetch<T>(path, {
    method: init?.method ?? "GET",
    body: init?.body,
    baseUrl: getMemberRegionsApiUrl(),
    cache: { noStore: true },
  });
}

export function listRegions(keyword?: string) {
  return regionsFetch<unknown>(API_ENDPOINTS.regions.list(keyword));
}

export function listMyMemberRegions() {
  return regionsFetch<ApiMemberRegion[]>(API_ENDPOINTS.memberRegions.list);
}

export function addMemberRegion(body: ApiAddMemberRegionRequest) {
  return regionsFetch<ApiMemberRegion>(API_ENDPOINTS.memberRegions.create, {
    method: "POST",
    body,
  });
}

export function changeMemberRegion(
  memberRegionId: number,
  body: ApiChangeMemberRegionRequest
) {
  return regionsFetch<ApiMemberRegion>(
    API_ENDPOINTS.memberRegions.change(memberRegionId),
    { method: "PATCH", body }
  );
}

export function setPrimaryMemberRegion(memberRegionId: number) {
  return regionsFetch<ApiMemberRegion>(
    API_ENDPOINTS.memberRegions.setPrimary(memberRegionId),
    { method: "PATCH" }
  );
}

export function verifyMemberRegion(
  memberRegionId: number,
  body: ApiVerifyMemberRegionRequest
) {
  return regionsFetch<ApiMemberRegion>(
    API_ENDPOINTS.memberRegions.verify(memberRegionId),
    { method: "POST", body }
  );
}

export async function deleteMemberRegion(
  memberRegionId: number
): Promise<void> {
  await regionsFetch<null>(API_ENDPOINTS.memberRegions.delete(memberRegionId), {
    method: "DELETE",
  });
}
