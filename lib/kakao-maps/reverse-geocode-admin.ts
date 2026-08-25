import { hasKakaoMapAppKey, loadKakaoMaps } from "@/lib/kakao-maps/load";
import {
  parseAdminRegionFromCoord2AddressResult,
  type AdminRegionLabels,
} from "@/lib/kakao-maps/parse-admin-region";

export type ReverseGeocodeAdminResult = AdminRegionLabels & {
  suggestedPlaceName: string;
};

/**
 * 좌표 → 장소명 + regionDong/regionGu (브라우저 카카오 SDK).
 * 키 없거나 실패 시 placeName만 빈 문자열·동/구 null.
 */
export async function reverseGeocodeAdminRegion(
  latitude: number,
  longitude: number
): Promise<ReverseGeocodeAdminResult> {
  const empty: ReverseGeocodeAdminResult = {
    suggestedPlaceName: "",
    regionDong: null,
    regionGu: null,
  };

  if (!hasKakaoMapAppKey()) return empty;
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return empty;

  try {
    const kakao = await loadKakaoMaps();
    return await new Promise((resolve) => {
      const geocoder = new kakao.maps.services.Geocoder();
      geocoder.coord2Address(longitude, latitude, (result, status) => {
        if (status !== kakao.maps.services.Status.OK || !result[0]) {
          resolve(empty);
          return;
        }
        const road = result[0].road_address;
        const jibun = result[0].address;
        const suggestedPlaceName =
          road?.building_name?.trim() ||
          road?.address_name?.trim() ||
          jibun?.address_name?.trim() ||
          "";
        const admin = parseAdminRegionFromCoord2AddressResult(result[0]);
        resolve({
          suggestedPlaceName,
          regionDong: admin.regionDong,
          regionGu: admin.regionGu,
        });
      });
    });
  } catch {
    return empty;
  }
}
