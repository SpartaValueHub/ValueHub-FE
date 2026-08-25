export {
  getKakaoMapAppKey,
  hasKakaoMapAppKey,
  loadKakaoMaps,
} from "@/lib/kakao-maps/load";
export {
  parseAdminRegionFromCoord2AddressResult,
  parseAdminRegionFromKakaoAddress,
} from "@/lib/kakao-maps/parse-admin-region";
export type { AdminRegionLabels } from "@/lib/kakao-maps/parse-admin-region";
export { reverseGeocodeAdminRegion } from "@/lib/kakao-maps/reverse-geocode-admin";
export type { ReverseGeocodeAdminResult } from "@/lib/kakao-maps/reverse-geocode-admin";
export type {
  KakaoMapsLoadStatus,
  UiLocationSelection,
} from "@/lib/kakao-maps/types";
