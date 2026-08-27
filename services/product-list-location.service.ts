/**
 * 상품목록 3km center — member-regions / 가입 address / guest GPS(URL·cookie).
 */
import { cookies } from "next/headers";

import {
  GUEST_LIST_CENTER_LAT_COOKIE,
  GUEST_LIST_CENTER_LNG_COOKIE,
  hasCompleteListCenter,
  parseListCenterSearchParams,
  type ParsedListCenterParams,
} from "@/lib/product-posts/list-center-params";
import { splitRegionName } from "@/lib/member-regions/region-name";
import { getAuthUser } from "@/lib/session";
import {
  listMyMemberRegionsService,
  listRegionsService,
} from "@/services/member-regions.service";
import { getMyMemberProfileService } from "@/services/member.service";
import type {
  ProductListLocationState,
  UiMemberRegion,
  UiProductListLocation,
} from "@/types/member-regions/ui";
import type { UiRegion } from "@/types/member-regions/ui";

async function readGuestCenterFromCookies(): Promise<{
  centerLatitude: number | null;
  centerLongitude: number | null;
}> {
  const jar = await cookies();
  const latRaw = jar.get(GUEST_LIST_CENTER_LAT_COOKIE)?.value;
  const lngRaw = jar.get(GUEST_LIST_CENTER_LNG_COOKIE)?.value;
  const lat = latRaw != null ? Number(latRaw) : NaN;
  const lng = lngRaw != null ? Number(lngRaw) : NaN;
  return {
    centerLatitude: Number.isFinite(lat) ? lat : null,
    centerLongitude: Number.isFinite(lng) ? lng : null,
  };
}

async function resolveRegionCenter(
  regionCode: number,
  regionName: string
): Promise<{ centerLatitude: number; centerLongitude: number } | null> {
  const regions = await listRegionsService(regionName);
  const match =
    regions.find((r) => r.regionCode === regionCode) ??
    regions.find((r) => r.regionName === regionName) ??
    regions[0];
  if (!match) return null;
  return {
    centerLatitude: match.centerLatitude,
    centerLongitude: match.centerLongitude,
  };
}

function pickMemberRegion(
  memberRegions: UiMemberRegion[],
  memberRegionId: number | null
): UiMemberRegion | null {
  if (memberRegions.length === 0) return null;
  if (memberRegionId != null) {
    return (
      memberRegions.find((r) => r.memberRegionId === memberRegionId) ?? null
    );
  }
  return memberRegions.find((r) => r.primary) ?? memberRegions[0] ?? null;
}

function buildMemberRegionLocation(
  selected: UiMemberRegion,
  memberRegions: UiMemberRegion[],
  center: { centerLatitude: number; centerLongitude: number }
): UiProductListLocation {
  const parts = splitRegionName(selected.regionName);
  const other = memberRegions.find(
    (r) => r.memberRegionId !== selected.memberRegionId
  );
  return {
    regionCity: parts.regionCity,
    regionDong: parts.regionDong,
    regionName: selected.regionName,
    centerLatitude: center.centerLatitude,
    centerLongitude: center.centerLongitude,
    memberRegionId: selected.memberRegionId,
    swapMemberRegionId:
      memberRegions.length >= 2 ? other?.memberRegionId : undefined,
    source: "member_region",
  };
}

async function resolveFromSignupAddress(
  address: string
): Promise<UiProductListLocation | null> {
  const trimmed = address.trim();
  if (!trimmed) return null;

  const parts = splitRegionName(trimmed);
  if (!parts.regionCity && !parts.regionDong) return null;

  const regions = await listRegionsService(trimmed);
  const tokens = trimmed.split(/\s+/).filter(Boolean);
  const dong = tokens[tokens.length - 1] ?? trimmed;
  const matched =
    regions.find((r) => r.regionName === trimmed) ??
    regions.find((r) => r.regionName.endsWith(dong)) ??
    regions.find((r) => tokens.every((t) => r.regionName.includes(t))) ??
    regions[0];

  if (!matched) return null;

  return {
    regionCity: parts.regionCity,
    regionDong: parts.regionDong,
    regionName: matched.regionName,
    centerLatitude: matched.centerLatitude,
    centerLongitude: matched.centerLongitude,
    source: "signup_address",
  };
}

function buildGuestLocation(
  centerLatitude: number,
  centerLongitude: number,
  admin?: Pick<UiRegion, "regionName"> | null
): UiProductListLocation {
  const parts = admin?.regionName
    ? splitRegionName(admin.regionName)
    : { regionCity: "", regionDong: "내 주변" };

  return {
    regionCity: parts.regionCity,
    regionDong: parts.regionDong || "내 주변",
    regionName: admin?.regionName?.trim() || "내 주변",
    centerLatitude,
    centerLongitude,
    source: "guest_gps",
  };
}

export type ResolveProductListLocationInput = {
  centerLatitude?: string | null;
  centerLongitude?: string | null;
  memberRegionId?: string | null;
  guestLocationDenied?: boolean;
};

/**
 * 목록 API center + 「내 위치」 UI 상태.
 * memberUuid 목록 호출에는 사용하지 않는다.
 */
export async function resolveProductListLocationService(
  input: ResolveProductListLocationInput
): Promise<ProductListLocationState> {
  const parsed = parseListCenterSearchParams(input);
  const user = await getAuthUser();

  if (user) {
    return resolveLoggedInLocation(parsed);
  }

  if (input.guestLocationDenied) {
    return { kind: "guest_denied" };
  }

  const urlCenter = hasCompleteListCenter(parsed)
    ? {
        centerLatitude: parsed.centerLatitude,
        centerLongitude: parsed.centerLongitude,
      }
    : null;

  if (urlCenter) {
    return {
      kind: "ready",
      location: buildGuestLocation(
        urlCenter.centerLatitude,
        urlCenter.centerLongitude
      ),
    };
  }

  const cookieCenter = await readGuestCenterFromCookies();
  if (hasCompleteListCenter(cookieCenter)) {
    return {
      kind: "ready",
      location: buildGuestLocation(
        cookieCenter.centerLatitude,
        cookieCenter.centerLongitude
      ),
    };
  }

  if (parsed.centerLatitude != null || parsed.centerLongitude != null) {
    return { kind: "empty" };
  }

  return { kind: "guest_needs_gps" };
}

async function resolveLoggedInLocation(
  parsed: ParsedListCenterParams
): Promise<ProductListLocationState> {
  const [profileResult, regionsResult] = await Promise.allSettled([
    getMyMemberProfileService(),
    listMyMemberRegionsService(),
  ]);

  const profile =
    profileResult.status === "fulfilled" ? profileResult.value : null;
  const memberRegions =
    regionsResult.status === "fulfilled" ? regionsResult.value : [];

  const selected = pickMemberRegion(memberRegions, parsed.memberRegionId);
  if (selected) {
    const center = await resolveRegionCenter(
      selected.regionCode,
      selected.regionName
    );
    if (center) {
      return {
        kind: "ready",
        location: buildMemberRegionLocation(selected, memberRegions, center),
      };
    }
  }

  const fromAddress = profile?.address
    ? await resolveFromSignupAddress(profile.address)
    : null;
  if (fromAddress) {
    return { kind: "ready", location: fromAddress };
  }

  if (hasCompleteListCenter(parsed)) {
    return {
      kind: "ready",
      location: buildGuestLocation(
        parsed.centerLatitude,
        parsed.centerLongitude
      ),
    };
  }

  return { kind: "empty" };
}

/** listProductPostsService params에 center query 추가 */
export function appendListCenterQuery(
  params: Record<string, string | string[]>,
  location: UiProductListLocation
) {
  params.centerLatitude = String(location.centerLatitude);
  params.centerLongitude = String(location.centerLongitude);
}
