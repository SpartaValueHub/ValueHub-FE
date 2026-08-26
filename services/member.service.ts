/**
 * member-service 오케스트레이션.
 */
import {
  checkNicknameAvailability,
  createMember,
  createMemberMediaPresignedUrl,
  getMemberPublicProfile,
  getMyMemberProfile,
  updateMyMember,
} from "@/lib/api/members";
import { mapMediaPresigned } from "@/lib/media/map-presign";
import type {
  ApiCreateMemberResponse,
  ApiMemberPublicProfileResponse,
  ApiUpdateMemberRequest,
} from "@/types/member/api";
import type {
  CreateMemberInput,
  UiMemberProfile,
  UiMemberPublicProfile,
} from "@/types/member/ui";
import type { UiMediaPresigned } from "@/types/media/ui";

function mapMemberProfile(response: ApiCreateMemberResponse): UiMemberProfile {
  return {
    memberUuid: response.memberUuid,
    nickname: response.nickname,
    profileImageUrl: response.profileImageUrl,
    memberGrade: response.memberGrade,
    address: response.address,
  };
}

type MemberServiceOptions = {
  cookieHeader?: string;
  completionToken?: string;
};

export async function createMemberService(
  input: CreateMemberInput,
  options: MemberServiceOptions
): Promise<UiMemberProfile> {
  const response = await createMember(
    {
      memberUuid: input.memberUuid,
      nickname: input.nickname,
      profileImageUrl: input.profileImageUrl,
      address: input.address,
      termConsents: input.termConsents,
    },
    { completionToken: options.completionToken }
  );
  return mapMemberProfile(response);
}

export async function getMyMemberProfileService(
  options: MemberServiceOptions = {}
): Promise<UiMemberProfile> {
  const response = await getMyMemberProfile({
    cookieHeader: options.cookieHeader,
  });
  return mapMemberProfile(response);
}

export async function checkNicknameAvailabilityService(nickname: string) {
  const result = await checkNicknameAvailability(nickname);
  return result.available;
}

function mapPublicProfile(
  response: ApiMemberPublicProfileResponse
): UiMemberPublicProfile {
  return {
    memberUuid: response.memberUuid,
    nickname: response.nickname.trim(),
    profileImageUrl: response.profileImageUrl,
  };
}

export async function getMemberPublicProfileService(
  memberUuid: string
): Promise<UiMemberPublicProfile> {
  const response = await getMemberPublicProfile(memberUuid);
  return mapPublicProfile(response);
}

export async function createMemberMediaPresignedUrlService(body: {
  contentType: string;
  contentLength: number;
}): Promise<UiMediaPresigned> {
  const api = await createMemberMediaPresignedUrl(body);
  return mapMediaPresigned(api);
}

export async function updateMyMemberService(
  body: ApiUpdateMemberRequest
): Promise<UiMemberProfile> {
  const response = await updateMyMember(body);
  return mapMemberProfile(response);
}
