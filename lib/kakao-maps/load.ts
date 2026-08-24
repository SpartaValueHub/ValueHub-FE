import type { KakaoMapsNamespace } from "@/lib/kakao-maps/types";

const SCRIPT_ID = "kakao-maps-sdk";

export function getKakaoMapAppKey(): string {
  return (process.env.NEXT_PUBLIC_KAKAO_MAP_APP_KEY ?? "").trim();
}

export function hasKakaoMapAppKey(): boolean {
  return getKakaoMapAppKey().length > 0;
}

let loadPromise: Promise<KakaoMapsNamespace> | null = null;

/**
 * 카카오맵 JS SDK 로드 (클라이언트 전용).
 * `libraries=services` — 좌표↔주소·키워드 검색.
 * 키 없음 / 로드 실패 시 throw.
 */
export function loadKakaoMaps(): Promise<KakaoMapsNamespace> {
  if (typeof window === "undefined") {
    return Promise.reject(
      new Error("카카오맵 SDK는 브라우저에서만 로드할 수 있습니다.")
    );
  }

  const key = getKakaoMapAppKey();
  if (!key) {
    return Promise.reject(
      new Error("NEXT_PUBLIC_KAKAO_MAP_APP_KEY가 설정되지 않았습니다.")
    );
  }

  if (window.kakao?.maps) {
    return Promise.resolve(window.kakao);
  }

  if (loadPromise) return loadPromise;

  loadPromise = new Promise<KakaoMapsNamespace>((resolve, reject) => {
    const finish = () => {
      const kakao = window.kakao;
      if (!kakao?.maps?.load) {
        reject(new Error("카카오맵 SDK 초기화에 실패했습니다."));
        return;
      }
      kakao.maps.load(() => {
        if (!window.kakao) {
          reject(new Error("카카오맵 SDK 로드 후 window.kakao가 없습니다."));
          return;
        }
        resolve(window.kakao);
      });
    };

    const existing = document.getElementById(
      SCRIPT_ID
    ) as HTMLScriptElement | null;
    if (existing) {
      if (window.kakao?.maps) {
        finish();
        return;
      }
      existing.addEventListener("load", finish, { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("카카오맵 스크립트 로드에 실패했습니다.")),
        { once: true }
      );
      return;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.async = true;
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(key)}&libraries=services&autoload=false`;
    script.onload = finish;
    script.onerror = () => {
      loadPromise = null;
      reject(new Error("카카오맵 스크립트 로드에 실패했습니다."));
    };
    document.head.appendChild(script);
  });

  return loadPromise;
}
