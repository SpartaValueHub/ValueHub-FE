/**
 * Member-Regions-Service API DTO (lib/api 전용).
 * docs/member-region-api.md 와 1:1.
 */

export interface ApiRegion {
  regionCode: number;
  regionName: string;
  centerLatitude: number;
  centerLongitude: number;
}

export interface ApiMemberRegion {
  memberRegionId: number;
  memberUuid: string;
  primary: boolean;
  regionCode: number;
  regionName: string;
  verified: boolean;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface ApiAddMemberRegionRequest {
  regionCode: number;
  primary?: boolean;
}

export interface ApiChangeMemberRegionRequest {
  regionCode: number;
}

export interface ApiVerifyMemberRegionRequest {
  latitude: number;
  longitude: number;
}
