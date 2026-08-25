/**
 * 카카오 지번/도로명 주소 → BE regionDong / regionGu.
 * 표시 우선순위와 별개로, 저장용 행정구역 라벨을 뽑는다.
 */

export type AdminRegionLabels = {
  regionDong: string | null;
  regionGu: string | null;
};

type KakaoAddressLike = {
  address_name?: string;
  region_2depth_name?: string;
  region_3depth_name?: string;
  region_4depth_name?: string;
};

function isDongLabel(token: string): boolean {
  return /(동|읍|면|가|리)$/u.test(token.trim());
}

function isGuLabel(token: string): boolean {
  const t = token.trim();
  // `성남시분당구` 같은 복합은 구 단위로 취급
  if (/구$/u.test(t)) return true;
  return false;
}

function normalizeLabel(token: string | undefined | null): string | null {
  const t = token?.trim() ?? "";
  if (!t || t.length > 50) return null;
  return t;
}

/** `성남시분당구` → `분당구` 우선, 없으면 원문 */
function preferGuSuffix(token: string): string {
  const m = token.match(/(.+구)$/u);
  return m?.[1] ?? token;
}

/**
 * address_name 예: `부산광역시 동구 초량동`
 * depth 필드가 있으면 우선 사용하고, 없으면 토큰 파싱.
 */
export function parseAdminRegionFromKakaoAddress(
  address?: KakaoAddressLike | null,
  roadAddressName?: string | null
): AdminRegionLabels {
  const depthCandidates = [
    address?.region_4depth_name,
    address?.region_3depth_name,
    address?.region_2depth_name,
  ]
    .map((v) => v?.trim())
    .filter((v): v is string => Boolean(v));

  let regionDong =
    depthCandidates.find(isDongLabel) != null
      ? normalizeLabel(depthCandidates.find(isDongLabel))
      : null;

  let regionGu: string | null = null;
  const guFromDepth = depthCandidates.find(isGuLabel);
  if (guFromDepth) {
    regionGu = normalizeLabel(preferGuSuffix(guFromDepth));
  } else if (address?.region_2depth_name?.trim()) {
    const r2 = address.region_2depth_name.trim();
    // 구가 없고 시만 있으면 구 필드는 비움 (동만 저장)
    if (isGuLabel(r2)) {
      regionGu = normalizeLabel(preferGuSuffix(r2));
    }
  }

  const addressName =
    address?.address_name?.trim() || roadAddressName?.trim() || "";
  if (addressName && (!regionDong || !regionGu)) {
    const parts = addressName.split(/\s+/).filter(Boolean);
    if (!regionDong) {
      const dong = [...parts].reverse().find(isDongLabel);
      regionDong = normalizeLabel(dong);
    }
    if (!regionGu) {
      const gu = [...parts].reverse().find(isGuLabel);
      regionGu = gu ? normalizeLabel(preferGuSuffix(gu)) : null;
    }
  }

  return { regionDong, regionGu };
}

export function parseAdminRegionFromCoord2AddressResult(result: {
  address?: KakaoAddressLike | null;
  road_address?: { address_name?: string; building_name?: string } | null;
}): AdminRegionLabels {
  return parseAdminRegionFromKakaoAddress(
    result.address,
    result.road_address?.address_name
  );
}
