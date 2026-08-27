/** 상품목록 PC 「내 위치」 한 줄 — 예: 부산 / 초량동 → `부산시 초량동` */
export function formatProductListLocationLabel(parts: {
  regionCity: string;
  regionDong: string;
}): string {
  const city = parts.regionCity.trim();
  const dong = parts.regionDong.trim();
  if (!city && !dong) return "";

  const cityLabel = city && !/(시|군)$/u.test(city) ? `${city}시` : city;
  return [cityLabel, dong].filter(Boolean).join(" ");
}

/** 상품목록 모바일 칩 — 동만 */
export function formatProductListLocationDong(regionDong: string): string {
  return regionDong.trim();
}
