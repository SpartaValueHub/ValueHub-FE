"use client";

import { useEffect, useRef, useState } from "react";

import { hasKakaoMapAppKey, loadKakaoMaps } from "@/lib/kakao-maps";
import type {
  KakaoMap,
  KakaoMapsNamespace,
  KakaoMarker,
} from "@/lib/kakao-maps/types";
import { cn } from "@/lib/utils";

const DEFAULT_LEVEL = 4;

type KakaoGpsMapProps = {
  className?: string;
  /** 브라우저 GPS */
  latitude: number;
  longitude: number;
  /** 검색으로 고른 동네 센터 — 있으면 마커 추가 + 지도 이동 */
  centerLatitude?: number | null;
  centerLongitude?: number | null;
  selectedRegionName?: string | null;
};

/**
 * 읽기 전용 카카오맵 — GPS 마커 + 선택 동네 센터 마커.
 * 동네 선택 시 해당 센터로 시야 이동(둘 다 보이면 bounds).
 */
export function KakaoGpsMap({
  className,
  latitude,
  longitude,
  centerLatitude = null,
  centerLongitude = null,
  selectedRegionName = null,
}: KakaoGpsMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<KakaoMap | null>(null);
  const gpsMarkerRef = useRef<KakaoMarker | null>(null);
  const centerMarkerRef = useRef<KakaoMarker | null>(null);
  const kakaoRef = useRef<KakaoMapsNamespace | null>(null);

  const [phase, setPhase] = useState<
    "missing-key" | "loading" | "ready" | "error"
  >(() => (hasKakaoMapAppKey() ? "loading" : "missing-key"));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 지도·GPS 마커 초기화 (GPS 고정)
  useEffect(() => {
    if (!hasKakaoMapAppKey()) return;
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return;

    let cancelled = false;

    void (async () => {
      try {
        const kakao = await loadKakaoMaps();
        if (cancelled || !containerRef.current) return;

        kakaoRef.current = kakao;
        const gps = new kakao.maps.LatLng(latitude, longitude);
        const map = new kakao.maps.Map(containerRef.current, {
          center: gps,
          level: DEFAULT_LEVEL,
        });
        mapRef.current = map;

        gpsMarkerRef.current = new kakao.maps.Marker({
          position: gps,
          map,
          title: "현재 GPS",
          zIndex: 1,
        });

        requestAnimationFrame(() => {
          map.relayout();
        });

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
      gpsMarkerRef.current?.setMap(null);
      centerMarkerRef.current?.setMap(null);
      gpsMarkerRef.current = null;
      centerMarkerRef.current = null;
      mapRef.current = null;
      kakaoRef.current = null;
    };
  }, [latitude, longitude]);

  // 선택 동네 센터 마커 + 지도 이동
  useEffect(() => {
    const kakao = kakaoRef.current;
    const map = mapRef.current;
    if (!kakao || !map || phase !== "ready") return;

    centerMarkerRef.current?.setMap(null);
    centerMarkerRef.current = null;

    const hasCenter =
      centerLatitude != null &&
      centerLongitude != null &&
      Number.isFinite(centerLatitude) &&
      Number.isFinite(centerLongitude);

    if (!hasCenter) {
      map.setCenter(new kakao.maps.LatLng(latitude, longitude));
      map.setLevel(DEFAULT_LEVEL);
      return;
    }

    const regionPos = new kakao.maps.LatLng(centerLatitude!, centerLongitude!);
    centerMarkerRef.current = new kakao.maps.Marker({
      position: regionPos,
      map,
      title: selectedRegionName ?? "선택한 동네",
      zIndex: 2,
    });

    const gpsPos = new kakao.maps.LatLng(latitude, longitude);
    const bounds = new kakao.maps.LatLngBounds();
    bounds.extend(gpsPos);
    bounds.extend(regionPos);
    map.setBounds(bounds, 40, 40, 40, 40);
    requestAnimationFrame(() => map.relayout());
  }, [
    phase,
    latitude,
    longitude,
    centerLatitude,
    centerLongitude,
    selectedRegionName,
  ]);

  const zoomBy = (delta: number) => {
    const map = mapRef.current;
    if (!map) return;
    map.setLevel(map.getLevel() + delta);
  };

  if (phase === "missing-key") {
    return (
      <div
        className={cn(
          "flex min-h-[240px] w-full flex-col items-center justify-center gap-2 bg-[#d9d9d9] px-4 text-center",
          className
        )}
      >
        <p className="font-sans text-sm text-[#606060]">
          카카오맵 키가 없습니다. GPS 좌표로만 인증할 수 있습니다.
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative min-h-[240px] w-full overflow-hidden bg-[#d9d9d9]",
        className
      )}
    >
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

      {phase === "ready" ? (
        <>
          <div className="pointer-events-none absolute top-2 left-2 z-[2] rounded bg-black/55 px-2 py-1 font-sans text-[10px] leading-snug text-white">
            내 GPS
            {selectedRegionName
              ? ` · 선택: ${selectedRegionName}`
              : " · 동네를 선택하면 기준점이 표시됩니다"}
          </div>
          <div className="pointer-events-none absolute inset-y-2.5 right-2.5 z-[2] flex flex-col justify-end">
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
        </>
      ) : null}
    </div>
  );
}
