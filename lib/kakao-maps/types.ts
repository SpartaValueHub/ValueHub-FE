/**
 * 카카오맵 공통 타입 — 브라우저 SDK (NEXT_PUBLIC_KAKAO_MAP_APP_KEY).
 * 도메인(상품·채팅·예약·동네)은 이 결과를 각자 API에 매핑한다.
 */

export type UiLocationSelection = {
  placeName: string;
  latitude: number;
  longitude: number;
};

export type KakaoMapsLoadStatus =
  "idle" | "loading" | "ready" | "missing-key" | "error";

/** window.kakao 최소 선언 — 전체 @types/kakao.maps 대신 사용분만 */
export type KakaoLatLng = {
  getLat: () => number;
  getLng: () => number;
};

export type KakaoMap = {
  setCenter: (latlng: KakaoLatLng) => void;
  setLevel: (level: number, options?: { animate?: boolean }) => void;
  getLevel: () => number;
  relayout: () => void;
  setBounds: (
    bounds: KakaoLatLngBounds,
    paddingTop?: number,
    paddingRight?: number,
    paddingBottom?: number,
    paddingLeft?: number
  ) => void;
};

export type KakaoLatLngBounds = {
  extend: (latlng: KakaoLatLng) => void;
};

export type KakaoMarker = {
  setMap: (map: KakaoMap | null) => void;
  setPosition: (latlng: KakaoLatLng) => void;
};

export type KakaoMapsNamespace = {
  maps: {
    load: (callback: () => void) => void;
    LatLng: new (lat: number, lng: number) => KakaoLatLng;
    LatLngBounds: new () => KakaoLatLngBounds;
    Map: new (
      container: HTMLElement,
      options: { center: KakaoLatLng; level: number }
    ) => KakaoMap;
    Marker: new (options: {
      position: KakaoLatLng;
      map?: KakaoMap;
      title?: string;
      zIndex?: number;
    }) => KakaoMarker;
    event: {
      addListener: (
        target: KakaoMap,
        type: string,
        handler: (e: { latLng: KakaoLatLng }) => void
      ) => void;
    };
    services: {
      Status: { OK: string; ZERO_RESULT: string; ERROR: string };
      Geocoder: new () => {
        coord2Address: (
          lng: number,
          lat: number,
          callback: (
            result: Array<{
              address?: { address_name?: string };
              road_address?: {
                address_name?: string;
                building_name?: string;
              } | null;
            }>,
            status: string
          ) => void
        ) => void;
      };
      Places: new () => {
        keywordSearch: (
          keyword: string,
          callback: (
            result: Array<{
              place_name: string;
              address_name: string;
              road_address_name?: string;
              y: string;
              x: string;
            }>,
            status: string
          ) => void
        ) => void;
      };
    };
  };
};

declare global {
  interface Window {
    kakao?: KakaoMapsNamespace;
  }
}

export {};
