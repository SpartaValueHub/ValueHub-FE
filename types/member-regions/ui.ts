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

/** 상품목록 3km center + UI */
export interface UiProductListLocation {
  regionCity: string;
  regionDong: string;
  regionName: string;
  centerLatitude: number;
  centerLongitude: number;
  memberRegionId?: number;
  /** member-regions 2개일 때 스왑 대상 */
  swapMemberRegionId?: number;
  source: "member_region" | "signup_address" | "guest_gps";
}

export type ProductListLocationState =
  | { kind: "ready"; location: UiProductListLocation }
  | { kind: "guest_needs_gps" }
  | { kind: "guest_denied" }
  | { kind: "empty" };
