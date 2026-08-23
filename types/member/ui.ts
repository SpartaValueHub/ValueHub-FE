/** member UI 모델 — Server Action·Service 경계 */

import type { ApiTermConsentItem } from "@/types/member/api";

export type UiMemberProfile = {
  memberUuid: string;
  nickname: string;
  profileImageUrl: string | null;
  memberGrade: string;
  address: string | null;
};

/** 공개 프로필 — 판매자 표시·채팅 핸드오프용 */
export type UiMemberPublicProfile = {
  memberUuid: string;
  nickname: string;
  profileImageUrl: string | null;
};

export type CreateMemberInput = {
  memberUuid: string;
  nickname: string;
  profileImageUrl?: string;
  address?: string;
  termConsents: ApiTermConsentItem[];
};
