/**
 * 유저 프로필 모달 오케스트레이션.
 * Member 공개 프로필(닉·이미지) + Auth 가입일 + 목업(등급·지역·별점·판매목록).
 */
import { USER_PROFILE_DEMO } from "@/constants/user-profile";
import { getMemberJoinedAtService } from "@/services/auth.service";
import { getMemberPublicProfileService } from "@/services/member.service";
import { formatJoinedAtLabel } from "@/services/mypage.service";
import type {
  UiUserProfile,
  UiUserProfileLoadResult,
} from "@/types/profile/ui";

export async function getUserProfileForDialogService(
  memberUuid: string
): Promise<UiUserProfileLoadResult> {
  const base: UiUserProfile = { ...USER_PROFILE_DEMO };
  const mockSources = {
    nickname: "mock" as const,
    avatar: "mock" as const,
    joinedAt: "mock" as const,
    trustGrade: "mock" as const,
    region: "mock" as const,
    rating: "mock" as const,
    products: "mock" as const,
  };

  const [memberResult, joinedResult] = await Promise.allSettled([
    getMemberPublicProfileService(memberUuid),
    getMemberJoinedAtService(memberUuid),
  ]);

  let profile: UiUserProfile = { ...base };
  const sources = { ...mockSources };

  if (memberResult.status === "fulfilled") {
    const publicProfile = memberResult.value;
    const hasNick = Boolean(publicProfile.nickname.trim());
    const hasAvatar = Boolean(publicProfile.profileImageUrl?.trim());
    if (hasNick) {
      profile = { ...profile, nickname: publicProfile.nickname.trim() };
      sources.nickname = "api";
    }
    if (hasAvatar) {
      profile = {
        ...profile,
        avatarUrl: publicProfile.profileImageUrl!.trim(),
      };
      sources.avatar = "api";
    }
  }

  if (joinedResult.status === "fulfilled") {
    const label = formatJoinedAtLabel(joinedResult.value.joinedAt);
    if (label) {
      profile = { ...profile, joinedAtLabel: label };
      sources.joinedAt = "api";
    }
  }

  return { profile, sources };
}
