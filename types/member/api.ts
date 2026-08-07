/**
 * member-service API DTO (lib/api 전용).
 */

export interface ApiCreateMemberRequest {
  memberUuid: string;
  nickname: string;
  profileImageUrl?: string;
  address?: string;
}

export interface ApiCreateMemberResponse {
  memberUuid: string;
  nickname: string;
  profileImageUrl: string | null;
  memberGrade: string;
  address: string | null;
}

export type ApiMemberProfileResponse = ApiCreateMemberResponse;

export interface ApiMemberAvailabilityResponse {
  available: boolean;
}
