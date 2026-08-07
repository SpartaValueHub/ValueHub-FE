import { apiFetch, getMemberApiUrl } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type {
  ApiCreateMemberRequest,
  ApiCreateMemberResponse,
  ApiMemberAvailabilityResponse,
  ApiMemberProfileResponse,
} from "@/types/member/api";

/** member-service HTTP — lib/api/* 전용. UI·actions에서 import 금지. */

type MemberRequestOptions = {
  cookieHeader?: string;
  completionToken?: string;
};

export function createMember(
  body: ApiCreateMemberRequest,
  options: MemberRequestOptions = {}
) {
  return apiFetch<ApiCreateMemberResponse>(API_ENDPOINTS.members.create, {
    method: "POST",
    body,
    baseUrl: getMemberApiUrl(),
    cache: { noStore: true },
    authorizationBearer: options.completionToken,
    skipSessionRecovery: Boolean(options.completionToken),
    timeoutMillis: 5_000,
  });
}

export function getMyMemberProfile(options: MemberRequestOptions = {}) {
  return apiFetch<ApiMemberProfileResponse>(API_ENDPOINTS.members.me, {
    baseUrl: getMemberApiUrl(),
    cache: { noStore: true },
    skipSessionRecovery: true,
    cookieHeader: options.cookieHeader,
    timeoutMillis: 5_000,
  });
}

export function checkNicknameAvailability(nickname: string) {
  return apiFetch<ApiMemberAvailabilityResponse>(
    API_ENDPOINTS.members.checkNickname(nickname),
    {
      baseUrl: getMemberApiUrl(),
      cache: { noStore: true },
      skipSessionRecovery: true,
      timeoutMillis: 3_000,
    }
  );
}
