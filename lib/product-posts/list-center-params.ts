/** GET /product-posts 3km 필터 query (BE #55) */
export const PRODUCT_LIST_CENTER_LAT_PARAM = "centerLatitude";
export const PRODUCT_LIST_CENTER_LNG_PARAM = "centerLongitude";
export const PRODUCT_LIST_MEMBER_REGION_ID_PARAM = "memberRegionId";

export const GUEST_LIST_CENTER_LAT_COOKIE = "vh_guest_center_lat";
export const GUEST_LIST_CENTER_LNG_COOKIE = "vh_guest_center_lng";

export type ParsedListCenterParams = {
  centerLatitude: number | null;
  centerLongitude: number | null;
  memberRegionId: number | null;
};

function parseCoord(raw: string | undefined | null): number | null {
  if (!raw?.trim()) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

export function parseListCenterSearchParams(input: {
  centerLatitude?: string | null;
  centerLongitude?: string | null;
  memberRegionId?: string | null;
}): ParsedListCenterParams {
  const lat = parseCoord(input.centerLatitude);
  const lng = parseCoord(input.centerLongitude);
  const memberRegionIdRaw = input.memberRegionId?.trim();
  const memberRegionId = memberRegionIdRaw
    ? Number.parseInt(memberRegionIdRaw, 10)
    : NaN;

  return {
    centerLatitude: lat,
    centerLongitude: lng,
    memberRegionId: Number.isFinite(memberRegionId) ? memberRegionId : null,
  };
}

export function hasCompleteListCenter(
  center: Pick<ParsedListCenterParams, "centerLatitude" | "centerLongitude">
): center is { centerLatitude: number; centerLongitude: number } {
  return center.centerLatitude != null && center.centerLongitude != null;
}

export function appendListCenterToSearchParams(
  sp: URLSearchParams,
  opts: {
    centerLatitude?: number | null;
    centerLongitude?: number | null;
    memberRegionId?: number | null;
  }
) {
  if (opts.memberRegionId != null) {
    sp.set(PRODUCT_LIST_MEMBER_REGION_ID_PARAM, String(opts.memberRegionId));
  }
  if (opts.centerLatitude != null && opts.centerLongitude != null) {
    sp.set(PRODUCT_LIST_CENTER_LAT_PARAM, String(opts.centerLatitude));
    sp.set(PRODUCT_LIST_CENTER_LNG_PARAM, String(opts.centerLongitude));
  }
}
