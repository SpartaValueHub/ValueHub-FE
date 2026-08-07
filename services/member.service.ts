/**
 * member-service 오케스트레이션.
 */
import {
  checkNicknameAvailability,
  createMember,
  getMyMemberProfile,
} from "@/lib/api/members";
import type { ApiCreateMemberResponse } from "@/types/member/api";
import type { CreateMemberInput, UiMemberProfile } from "@/types/member/ui";

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
