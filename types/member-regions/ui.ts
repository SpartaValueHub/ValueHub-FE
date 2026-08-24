/**
 * Member-Regions UI 모델.
 */

export interface UiRegion {
  regionCode: number;
  regionName: string;
  centerLatitude: number;
  centerLongitude: number;
}

export interface UiMemberRegion {
  memberRegionId: number;
  primary: boolean;
  regionCode: number;
  regionName: string;
  verified: boolean;
  verifiedAt: string | null;
}
