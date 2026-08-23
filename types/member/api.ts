/**
 * member-service API DTO (lib/api 전용).
 */

export type ApiTermCode =
  "TERMS_OF_SERVICE" | "PRIVACY_POLICY" | "EMAIL_MARKETING" | "SMS_MARKETING";

export type ApiTermConsentItem = {
  termCode: ApiTermCode;
  agreed: boolean;
};

export interface ApiCreateMemberRequest {
  memberUuid: string;
  nickname: string;
  profileImageUrl?: string;
  address?: string;
  termConsents: ApiTermConsentItem[];
}

export interface ApiCreateMemberResponse {
  memberUuid: string;
  nickname: string;
  profileImageUrl: string | null;
  memberGrade: string;
  address: string | null;
}

export type ApiMemberProfileResponse = ApiCreateMemberResponse;

/** GET /api/v1/members/{memberUuid}/profile */
export interface ApiMemberPublicProfileResponse {
  memberUuid: string;
  nickname: string;
  profileImageUrl: string | null;
  /** 공개 프로필에 포함되면 채팅방 생성 sellerMemberGrade로 사용 */
  memberGrade?: string | null;
}

export interface ApiMemberAvailabilityResponse {
  available: boolean;
}
