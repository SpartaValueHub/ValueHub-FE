/**
 * 마이페이지·목록 카피용 거래 장소 표시명.
 * BE 권장: regionDong ?? regionGu ?? placeName
 */
export function resolveTradeLocationLabel(input: {
  regionDong?: string | null;
  regionGu?: string | null;
  placeName?: string | null;
}): string {
  const dong = input.regionDong?.trim() ?? "";
  if (dong) return dong;
  const gu = input.regionGu?.trim() ?? "";
  if (gu) return gu;
  return input.placeName?.trim() ?? "";
}
