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
}

export interface ApiMemberAvailabilityResponse {
  available: boolean;
}

/** PATCH /api/v1/members/me — null/omit = 유지 */
export interface ApiUpdateMemberRequest {
  nickname?: string | null;
  profileImageUrl?: string | null;
  address?: string | null;
}

export type ApiUpdateMemberResponse = ApiCreateMemberResponse;
