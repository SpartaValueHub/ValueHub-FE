/**
 * regionName / address → 마이페이지 표시용 시·동만.
 * 예: `경기도 성남시분당구 판교동` → { regionCity: "성남", regionDong: "판교동" }
 * 구·도는 표시하지 않음.
 */

function toShortCityLabel(cityToken: string): string {
  return cityToken
    .replace(/(특별자치시|특별시|광역시)$/u, "")
    .replace(/시$/u, "")
    .replace(/군$/u, "")
    .trim();
}

/** `성남시분당구` → `성남시` */
function unwrapCityFromCompound(token: string): string | null {
  const m = token.match(
    /^(.+?(?:특별자치시|특별시|광역시|시|군))(.+?(?:구|군))$/u
  );
  return m?.[1] ?? null;
}

function isDongToken(token: string): boolean {
  return /(동|읍|면|가|리)$/u.test(token);
}

function isCityLikeToken(token: string): boolean {
  if (/구$/u.test(token) && !/(시|군).+구$/u.test(token)) return false;
  return /(특별자치시|특별시|광역시|특별자치도|시|군)$/u.test(token);
}

export function splitRegionName(regionName: string): {
  regionCity: string;
  regionDong: string;
} {
  const parts = regionName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return { regionCity: "", regionDong: "" };
  }

  const dong =
    [...parts].reverse().find((p) => isDongToken(p)) ??
    (parts.length === 1 && isDongToken(parts[0]!) ? parts[0]! : "");

  let cityRaw = "";
  for (const part of parts) {
    if (dong && part === dong) continue;
    const fromCompound = unwrapCityFromCompound(part);
    if (fromCompound) {
      cityRaw = fromCompound;
      break;
    }
    if (isCityLikeToken(part)) {
      // 도(경기도)보다 시 우선 — 뒤에 나오는 시로 덮어씀
      if (/도$/u.test(part) && cityRaw) continue;
      cityRaw = part;
      if (!/도$/u.test(part)) {
        // 시·군을 찾으면 계속 스캔해 더 구체적 시를 쓸 수 있음
      }
    }
  }

  // 도만 잡힌 경우 비움 (표시는 시·동만)
  if (/도$/u.test(cityRaw) && !/(시|군)$/u.test(cityRaw)) {
    cityRaw = "";
  }

  const regionCity = cityRaw ? toShortCityLabel(cityRaw) : "";
  const regionDong = dong;

  if (!regionCity && !regionDong && parts.length === 1) {
    return { regionCity: "", regionDong: parts[0]! };
  }

  return { regionCity, regionDong };
}
