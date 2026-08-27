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

/** 상품목록 · 활동 지역 표시용 시·동 */
export interface UiActivityRegionLabel {
  regionCity: string;
  regionDong: string;
  source: "member_region" | "signup_address";
}
