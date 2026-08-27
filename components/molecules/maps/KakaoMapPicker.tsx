"use client";

import { useEffect, useRef, useState } from "react";

import { hasKakaoMapAppKey, loadKakaoMaps } from "@/lib/kakao-maps";
import { parseAdminRegionFromCoord2AddressResult } from "@/lib/kakao-maps/parse-admin-region";
import type {
  KakaoMap,
  KakaoMapsNamespace,
  KakaoMarker,
} from "@/lib/kakao-maps/types";
import { cn } from "@/lib/utils";

const DEFAULT_LAT = 37.5665;
const DEFAULT_LNG = 126.978;
const DEFAULT_LEVEL = 3;

export type KakaoMapPickResult = {
  latitude: number;
  longitude: number;
  /** 역지오코딩 장소명 (실패 시 빈 문자열) */
  suggestedPlaceName: string;
  regionDong: string | null;
  regionGu: string | null;
};

function resolvePickLabels(
  kakao: KakaoMapsNamespace,
  result: Array<{
    address?: {
      address_name?: string;
      region_2depth_name?: string;
      region_3depth_name?: string;
      region_4depth_name?: string;
    };
    road_address?: {
      address_name?: string;
      building_name?: string;
    } | null;
  }>,
  status: string
): Pick<KakaoMapPickResult, "suggestedPlaceName" | "regionDong" | "regionGu"> {
  if (status !== kakao.maps.services.Status.OK || !result[0]) {
    return { suggestedPlaceName: "", regionDong: null, regionGu: null };
  }
  const road = result[0].road_address;
  const jibun = result[0].address;
  const suggestedPlaceName =
    road?.building_name?.trim() ||
    road?.address_name?.trim() ||
    jibun?.address_name?.trim() ||
    "";
  const admin = parseAdminRegionFromCoord2AddressResult(result[0]);
  return {
    suggestedPlaceName,
    regionDong: admin.regionDong,
    regionGu: admin.regionGu,
  };
}

type KakaoMapPickerProps = {
  className?: string;
  initialLatitude?: number | null;
  initialLongitude?: number | null;
  /** false면 마커만 표시 (채팅 말풍선·확대 보기) */
  interactive?: boolean;
  /** 부모 높이를 채움 (예약 패널 미리보기). 기본 400px 사각 제약 해제 */
  fill?: boolean;
  /** 지도 클릭·현위치 이동 시. interactive일 때 사용 */
  onPick?: (result: KakaoMapPickResult) => void;
};

function waitForElementSize(
  element: HTMLElement,
  isCancelled: () => boolean
): Promise<void> {
  if (element.clientWidth > 0 && element.clientHeight > 0) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const finish = () => {
      resizeObserver.disconnect();
      window.clearTimeout(timeoutId);
      resolve();
    };

    const resizeObserver = new ResizeObserver(() => {
      if (element.clientWidth > 0 && element.clientHeight > 0) {
        finish();
      }
    });
    resizeObserver.observe(element);

    const timeoutId = window.setTimeout(finish, 2000);

    if (isCancelled()) finish();
  });
}

/**
 * 카카오맵 클릭 픽커 — SDK 로드·마커·역지오코딩.
 * 키 없으면 안내 UI만 (throw 없음).
 */
export function KakaoMapPicker({
  className,
  initialLatitude,
  initialLongitude,
  interactive = true,
  fill = false,
  onPick,
}: KakaoMapPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<KakaoMap | null>(null);
  const markerRef = useRef<KakaoMarker | null>(null);
  const kakaoRef = useRef<KakaoMapsNamespace | null>(null);
  const onPickRef = useRef(onPick);

  const [phase, setPhase] = useState<
    "missing-key" | "loading" | "ready" | "error"
  >(() => (hasKakaoMapAppKey() ? "loading" : "missing-key"));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const shellClassName = cn(
    "relative overflow-hidden bg-[#d9d9d9]",
    fill
      ? "h-full min-h-0 w-full"
      : "min-h-[240px] w-full sm:min-h-[400px] sm:size-[400px]",
    className
  );

  useEffect(() => {
    onPickRef.current = onPick;
  }, [onPick]);

  useEffect(() => {
    if (!hasKakaoMapAppKey()) {
      return;
    }

    let cancelled = false;
    let resizeObserver: ResizeObserver | null = null;

    void (async () => {
      try {
        const kakao = await loadKakaoMaps();
        if (cancelled || !containerRef.current) return;

        await waitForElementSize(containerRef.current, () => cancelled);
        if (cancelled || !containerRef.current) return;

        kakaoRef.current = kakao;
        const lat =
          initialLatitude != null && Number.isFinite(initialLatitude)
            ? initialLatitude
            : DEFAULT_LAT;
        const lng =
          initialLongitude != null && Number.isFinite(initialLongitude)
            ? initialLongitude
            : DEFAULT_LNG;

        const center = new kakao.maps.LatLng(lat, lng);
        const map = new kakao.maps.Map(containerRef.current, {
          center,
          level: DEFAULT_LEVEL,
        });
        mapRef.current = map;

        const marker = new kakao.maps.Marker({ position: center, map });
        markerRef.current = marker;

        if (!interactive) {
          map.setDraggable?.(false);
          map.setZoomable?.(false);
        }

        const reverseAndNotify = (latLng: {
          getLat: () => number;
          getLng: () => number;
        }) => {
          const latitude = latLng.getLat();
          const longitude = latLng.getLng();
          marker.setPosition(latLng);
          map.setCenter(latLng);

          const geocoder = new kakao.maps.services.Geocoder();
          geocoder.coord2Address(longitude, latitude, (result, status) => {
            const labels = resolvePickLabels(kakao, result, status);
            onPickRef.current?.({
              latitude,
              longitude,
              ...labels,
            });
          });
        };

        if (interactive) {
          kakao.maps.event.addListener(map, "click", (mouseEvent) => {
            reverseAndNotify(mouseEvent.latLng);
          });
        }

        const relayout = () => {
          map.relayout();
          map.setCenter(center);
        };
        requestAnimationFrame(relayout);

        let lastWidth = 0;
        let lastHeight = 0;
        resizeObserver = new ResizeObserver((entries) => {
          const size = entries[0]?.contentRect;
          if (
            !size ||
            (size.width === lastWidth && size.height === lastHeight)
          ) {
            return;
          }
          lastWidth = size.width;
          lastHeight = size.height;
          if (size.width > 0 && size.height > 0) relayout();
        });
        resizeObserver.observe(containerRef.current);

        if (!cancelled) setPhase("ready");
      } catch (e) {
        if (cancelled) return;
        setPhase("error");
        setErrorMessage(
          e instanceof Error ? e.message : "지도를 불러오지 못했습니다."
        );
      }
    })();

    return () => {
      cancelled = true;
      resizeObserver?.disconnect();
      markerRef.current?.setMap(null);
      markerRef.current = null;
      mapRef.current = null;
      kakaoRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const moveToCurrentLocation = () => {
    const kakao = kakaoRef.current;
    const map = mapRef.current;
    if (!kakao || !map || !navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const latLng = new kakao.maps.LatLng(
          pos.coords.latitude,
          pos.coords.longitude
        );
        map.setCenter(latLng);
        markerRef.current?.setPosition(latLng);
        const geocoder = new kakao.maps.services.Geocoder();
        geocoder.coord2Address(
          pos.coords.longitude,
          pos.coords.latitude,
          (result, status) => {
            const labels = resolvePickLabels(kakao, result, status);
            onPickRef.current?.({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              ...labels,
            });
          }
        );
      },
      () => {
        setErrorMessage(
          "현재 위치를 가져오지 못했습니다. 권한을 확인해 주세요."
        );
      },
      { enableHighAccuracy: true, timeout: 10_000 }
    );
  };

  const zoomBy = (delta: number) => {
    const map = mapRef.current;
    if (!map) return;
    map.setLevel(map.getLevel() + delta);
  };

  if (phase === "missing-key") {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-2 px-4 text-center",
          shellClassName
        )}
      >
        <p className="font-sans text-sm text-[#606060]">
          카카오맵 키가 없습니다.
        </p>
        <p className="font-sans text-xs leading-relaxed text-[#868686]">
          `.env.local`에 `NEXT_PUBLIC_KAKAO_MAP_APP_KEY`를 넣고
          <br />
          서버를 재시작하세요.
          <br />
          안내: <code className="text-[11px]">docs/kakao-map-setup.md</code>
        </p>
      </div>
    );
  }

  return (
    <div className={shellClassName}>
      <div ref={containerRef} className="absolute inset-0" />

      {phase === "loading" ? (
        <div className="absolute inset-0 z-[1] flex items-center justify-center bg-[#d9d9d9]/60">
          <p className="font-sans text-sm text-[#606060]">지도 불러오는 중…</p>
        </div>
      ) : null}

      {phase === "error" ? (
        <div className="absolute inset-0 z-[1] flex items-center justify-center bg-[#d9d9d9] px-4 text-center">
          <p className="font-sans text-sm text-[#606060]">
            {errorMessage ?? "지도를 불러오지 못했습니다."}
          </p>
        </div>
      ) : null}

      {phase === "ready" && interactive ? (
        <div className="pointer-events-none absolute inset-y-2.5 right-2.5 z-[2] flex flex-col items-end justify-between">
          <button
            type="button"
            aria-label="현재 위치로 이동"
            className="pointer-events-auto flex size-9 items-center justify-center rounded-[6px] bg-white shadow-[0_0_5px_rgba(0,0,0,0.25)]"
            onClick={moveToCurrentLocation}
          >
            <span className="font-sans text-[10px] text-[#323232]">GPS</span>
          </button>
          <div className="flex flex-col gap-1.5">
            <button
              type="button"
              aria-label="확대"
              className="pointer-events-auto flex size-9 items-center justify-center rounded-[6px] bg-white font-sans text-lg text-[#323232] shadow-[0_0_5px_rgba(0,0,0,0.25)]"
              onClick={() => zoomBy(-1)}
            >
              +
            </button>
            <button
              type="button"
              aria-label="축소"
              className="pointer-events-auto flex size-9 items-center justify-center rounded-[6px] bg-white font-sans text-lg text-[#323232] shadow-[0_0_5px_rgba(0,0,0,0.25)]"
              onClick={() => zoomBy(1)}
            >
              −
            </button>
          </div>
        </div>
      ) : null}

      {errorMessage && phase === "ready" ? (
        <p
          className="absolute bottom-2 left-2 z-[2] max-w-[70%] rounded bg-black/60 px-2 py-1 font-sans text-[10px] text-white"
          role="status"
        >
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
