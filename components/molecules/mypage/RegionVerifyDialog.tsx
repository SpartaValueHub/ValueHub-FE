"use client";

import { useEffect, useMemo, useState } from "react";

import { listRegionsAction } from "@/actions/member-regions";
import { Button } from "@/components/atoms/button";
import { VhInput } from "@/components/atoms/vh-input";
import { KakaoGpsMap } from "@/components/molecules/maps/KakaoGpsMap";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/molecules/overlay/Dialog";
import { hasKakaoMapAppKey, loadKakaoMaps } from "@/lib/kakao-maps";
import { splitRegionName } from "@/lib/member-regions/region-name";
import { cn } from "@/lib/utils";
import type { UiRegion } from "@/types/member-regions/ui";

const VERIFY_RADIUS_KM = 3;

type RegionVerifyDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 가입 주소 힌트 (잘못됐을 수 있음 — 검색으로 변경 가능) */
  initialKeyword?: string;
  /** primary = 현재 활동 지역 / secondary = 활동지역 추가 */
  slot?: "primary" | "secondary";
  submitting: boolean;
  onConfirm: (payload: {
    regionCode: number;
    latitude: number;
    longitude: number;
    slot: "primary" | "secondary";
  }) => void;
};

function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const r = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * r * Math.asin(Math.sqrt(a));
}

/**
 * 동네 인증 (B) — GPS 표시 + 동네 검색·선택 후 BE verify.
 * 가입 주소가 틀려도 여기서 올바른 동을 고를 수 있음.
 */
export function RegionVerifyDialog({
  open,
  onOpenChange,
  initialKeyword = "",
  slot = "primary",
  submitting,
  onConfirm,
}: RegionVerifyDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? (
        <RegionVerifyDialogBody
          key={`${slot}-${initialKeyword}`}
          initialKeyword={initialKeyword}
          slot={slot}
          submitting={submitting}
          onClose={() => onOpenChange(false)}
          onConfirm={onConfirm}
        />
      ) : null}
    </Dialog>
  );
}

function RegionVerifyDialogBody({
  initialKeyword,
  slot,
  submitting,
  onClose,
  onConfirm,
}: {
  initialKeyword: string;
  slot: "primary" | "secondary";
  submitting: boolean;
  onClose: () => void;
  onConfirm: (payload: {
    regionCode: number;
    latitude: number;
    longitude: number;
    slot: "primary" | "secondary";
  }) => void;
}) {
  const [gpsPhase, setGpsPhase] = useState<
    "loading" | "ready" | "denied" | "unsupported"
  >(() =>
    typeof navigator !== "undefined" && navigator.geolocation
      ? "loading"
      : "unsupported"
  );
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  const [keyword, setKeyword] = useState(initialKeyword.trim());
  const [results, setResults] = useState<UiRegion[]>([]);
  const [selected, setSelected] = useState<UiRegion | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [gpsHint, setGpsHint] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        setGpsPhase("ready");
      },
      () => setGpsPhase("denied"),
      { enableHighAccuracy: true, timeout: 12_000 }
    );
  }, []);

  /** GPS → 카카오 역지오코딩 힌트. 가입 키워드가 없으면 검색어로도 사용 */
  useEffect(() => {
    if (gpsPhase !== "ready" || latitude == null || longitude == null) return;
    if (!hasKakaoMapAppKey()) return;

    let cancelled = false;
    void (async () => {
      try {
        const kakao = await loadKakaoMaps();
        if (cancelled) return;
        const geocoder = new kakao.maps.services.Geocoder();
        geocoder.coord2Address(longitude, latitude, (result, status) => {
          if (cancelled) return;
          if (status !== kakao.maps.services.Status.OK || !result[0]) return;
          const addr =
            result[0].address?.address_name?.trim() ||
            result[0].road_address?.address_name?.trim() ||
            "";
          if (!addr) return;
          const parts = addr.split(/\s+/).filter(Boolean);
          const dong =
            [...parts].reverse().find((p) => /(동|읍|면|가|리)$/.test(p)) ??
            parts[parts.length - 1] ??
            "";
          setGpsHint(addr);
          if (!initialKeyword.trim() && dong) {
            setKeyword(dong);
          }
        });
      } catch {
        /* 검색은 수동으로 가능 */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [gpsPhase, latitude, longitude, initialKeyword]);

  useEffect(() => {
    const q = keyword.trim();
    if (q.length < 1) return;

    let cancelled = false;
    const timer = window.setTimeout(() => {
      setSearching(true);
      void listRegionsAction(q).then((res) => {
        if (cancelled) return;
        setSearching(false);
        if (!res.ok) {
          setSearchError(res.message);
          setResults([]);
          return;
        }
        setSearchError(null);
        setResults(res.data.slice(0, 40));
      });
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [keyword]);

  const sortedResults = useMemo(() => {
    if (latitude == null || longitude == null) return results;
    return [...results].sort((a, b) => {
      const da = haversineKm(
        latitude,
        longitude,
        a.centerLatitude,
        a.centerLongitude
      );
      const db = haversineKm(
        latitude,
        longitude,
        b.centerLatitude,
        b.centerLongitude
      );
      return da - db;
    });
  }, [results, latitude, longitude]);

  const visibleResults = keyword.trim().length < 1 ? [] : sortedResults;

  const canSubmit =
    gpsPhase === "ready" &&
    latitude != null &&
    longitude != null &&
    selected != null &&
    !submitting;

  return (
    <DialogContent
      showClose
      onClose={onClose}
      className="max-h-[90vh] w-full max-w-[480px] gap-4 overflow-y-auto px-5 pb-0 sm:px-8"
    >
      <DialogHeader className="px-0">
        <DialogTitle className="text-xl text-[#323232]">
          {slot === "secondary" ? "활동지역 추가·인증" : "동네 인증"}
        </DialogTitle>
        <DialogDescription className="text-left text-sm leading-relaxed text-[#606060]">
          {slot === "secondary"
            ? "추가할 동네를 검색·선택한 뒤, 현재 GPS로 인증합니다."
            : "인증할 동네를 검색·선택한 뒤, 현재 GPS로 인증합니다. 이미 인증된 동네도 여기서 바꿀 수 있습니다."}
        </DialogDescription>
      </DialogHeader>

      {gpsPhase === "loading" ? (
        <div className="flex min-h-[200px] items-center justify-center bg-[#d9d9d9]">
          <p className="font-sans text-sm text-[#606060]">
            현재 위치를 확인하는 중…
          </p>
        </div>
      ) : null}

      {gpsPhase === "denied" || gpsPhase === "unsupported" ? (
        <div className="flex min-h-[200px] flex-col items-center justify-center gap-2 bg-[#d9d9d9] px-4 text-center">
          <p className="font-sans text-sm text-[#606060]">
            {gpsPhase === "unsupported"
              ? "이 브라우저에서는 위치 정보를 사용할 수 없습니다."
              : "위치 권한을 허용한 뒤 다시 시도해 주세요."}
          </p>
        </div>
      ) : null}

      {gpsPhase === "ready" && latitude != null && longitude != null ? (
        <KakaoGpsMap
          className="h-[220px] w-full shrink-0"
          latitude={latitude}
          longitude={longitude}
          centerLatitude={selected?.centerLatitude ?? null}
          centerLongitude={selected?.centerLongitude ?? null}
          selectedRegionName={
            selected
              ? (() => {
                  const p = splitRegionName(selected.regionName);
                  return [p.regionCity, p.regionDong].filter(Boolean).join(" ");
                })()
              : null
          }
        />
      ) : null}

      {gpsHint ? (
        <p className="font-sans text-xs leading-snug text-[#868686]">
          현재 GPS 추정 주소: {gpsHint}
        </p>
      ) : null}

      <VhInput
        value={keyword}
        onChange={(e) => {
          setKeyword(e.target.value);
          setSelected(null);
        }}
        placeholder="동·읍·면 이름 (예: 판교동)"
        inputState={keyword ? "focus" : "default"}
        className="border-[#d0d0d0] py-2.5 text-[#323232] placeholder:text-[#ababab]"
      />

      <div className="flex max-h-[220px] min-h-[120px] flex-col overflow-hidden border border-[#d0d0d0]">
        <ul className="flex-1 overflow-y-auto overscroll-contain">
          {!keyword.trim() ? (
            <li className="px-3 py-3 font-sans text-sm leading-normal text-[#868686]">
              동 이름을 입력해 검색하세요.
            </li>
          ) : null}
          {searching ? (
            <li className="px-3 py-3 font-sans text-sm leading-normal text-[#868686]">
              검색 중…
            </li>
          ) : null}
          {!searching && keyword.trim() && visibleResults.length === 0 ? (
            <li className="px-3 py-3 font-sans text-sm leading-normal text-[#868686]">
              검색 결과가 없습니다. 「판교동」처럼 동 이름만 입력해 보세요.
            </li>
          ) : null}
          {visibleResults.map((region) => {
            const active = selected?.regionCode === region.regionCode;
            const parts = splitRegionName(region.regionName);
            const label =
              [parts.regionCity, parts.regionDong].filter(Boolean).join(" ") ||
              region.regionName;
            const dist =
              latitude != null && longitude != null
                ? haversineKm(
                    latitude,
                    longitude,
                    region.centerLatitude,
                    region.centerLongitude
                  )
                : null;
            const tooFar = dist != null && dist > VERIFY_RADIUS_KM;
            return (
              <li
                key={region.regionCode}
                className="border-b border-[#ebebeb] last:border-b-0"
              >
                <button
                  type="button"
                  onClick={() => setSelected(region)}
                  className={cn(
                    "flex min-h-[52px] w-full items-center gap-3 px-3 py-3 text-left",
                    active ? "bg-[#f8e3b9]" : "bg-white hover:bg-[#f5f5f5]"
                  )}
                >
                  <span className="min-w-0 flex-1 font-sans text-sm leading-snug break-keep text-[#323232]">
                    {label}
                    <span className="mt-0.5 block text-[11px] leading-snug text-[#ababab]">
                      {region.regionName}
                    </span>
                  </span>
                  {dist != null ? (
                    <span
                      className={cn(
                        "shrink-0 rounded px-2 py-1 font-sans text-xs leading-none",
                        tooFar
                          ? "bg-[#ffe8e0] text-[#ff5d31]"
                          : "bg-[#eef6ee] text-[#2f6b2f]"
                      )}
                    >
                      {dist < 1
                        ? `${Math.round(dist * 1000)}m`
                        : `${dist.toFixed(1)}km`}
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {selected ? (
        <p className="font-sans text-sm leading-snug text-[#323232]">
          선택:{" "}
          <span className="font-medium">
            {(() => {
              const p = splitRegionName(selected.regionName);
              return (
                [p.regionCity, p.regionDong].filter(Boolean).join(" ") ||
                selected.regionName
              );
            })()}
          </span>
          {latitude != null && longitude != null ? (
            <span className="text-[#868686]">
              {" "}
              · GPS까지{" "}
              {haversineKm(
                latitude,
                longitude,
                selected.centerLatitude,
                selected.centerLongitude
              ).toFixed(1)}
              km
              {haversineKm(
                latitude,
                longitude,
                selected.centerLatitude,
                selected.centerLongitude
              ) > VERIFY_RADIUS_KM
                ? " (3km 밖 — 인증 실패 가능)"
                : " (3km 안)"}
            </span>
          ) : null}
        </p>
      ) : null}

      {searchError ? (
        <p className="font-sans text-sm text-[#ff5d31]" role="alert">
          {searchError}
        </p>
      ) : null}

      <p className="font-sans text-xs leading-relaxed text-[#868686]">
        지도의 한쪽은 내 GPS, 다른 쪽은 선택한 동네 기준점입니다. 약 3km
        이내여야 인증됩니다. (서버 판정)
      </p>

      <DialogFooter className="gap-2 px-0 py-6 sm:px-0">
        <Button
          type="button"
          variant="modal"
          size="modal"
          className="min-w-0 flex-1"
          disabled={submitting}
          onClick={onClose}
        >
          취소
        </Button>
        <Button
          type="button"
          variant="modal-filled"
          size="modal"
          className="min-w-0 flex-1"
          disabled={!canSubmit}
          aria-busy={submitting}
          onClick={() => {
            if (!selected || latitude == null || longitude == null) return;
            onConfirm({
              regionCode: selected.regionCode,
              latitude,
              longitude,
              slot,
            });
          }}
        >
          {submitting
            ? "인증 중…"
            : slot === "secondary"
              ? "이 동네로 추가·인증"
              : "이 동네로 인증하기"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
