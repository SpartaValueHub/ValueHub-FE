"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

import { setGuestListCenterAction } from "@/actions/product-list-location";
import { Icon } from "@/components/atoms/icons";
import {
  productPostsListHref,
  type ProductPostsListHrefOpts,
} from "@/constants/product-posts";
import {
  formatProductListLocationDong,
  formatProductListLocationLabel,
} from "@/lib/member-regions/format-list-location";
import { cn } from "@/lib/utils";
import type {
  ProductListLocationState,
  UiProductListLocation,
} from "@/types/member-regions/ui";

const LOCATION_DENIED_PARAM = "locationDenied";

type ProductListLocationControlsProps = {
  locationState: ProductListLocationState;
  filterOpts: ProductPostsListHrefOpts;
  variant: "desktop" | "mobile";
};

function buildSwapHref(
  filterOpts: ProductPostsListHrefOpts,
  location: UiProductListLocation
) {
  if (location.swapMemberRegionId == null) return null;
  return productPostsListHref({
    ...filterOpts,
    page: 1,
    memberRegionId: location.swapMemberRegionId,
    centerLatitude: null,
    centerLongitude: null,
  });
}

export function ProductListGuestLocationInit({
  needsGps,
}: {
  needsGps: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const started = useRef(false);

  useEffect(() => {
    if (!needsGps || started.current) return;
    started.current = true;

    if (typeof navigator === "undefined" || !navigator.geolocation) {
      const sp = new URLSearchParams(searchParams.toString());
      sp.set(LOCATION_DENIED_PARAM, "1");
      sp.delete("page");
      router.replace(`${pathname}?${sp.toString()}`);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        void (async () => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          await setGuestListCenterAction(lat, lng);
          const sp = new URLSearchParams(searchParams.toString());
          sp.set("centerLatitude", String(lat));
          sp.set("centerLongitude", String(lng));
          sp.delete(LOCATION_DENIED_PARAM);
          sp.delete("page");
          router.replace(`${pathname}?${sp.toString()}`);
        })();
      },
      () => {
        const sp = new URLSearchParams(searchParams.toString());
        sp.set(LOCATION_DENIED_PARAM, "1");
        sp.delete("page");
        router.replace(`${pathname}?${sp.toString()}`);
      },
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 60_000 }
    );
  }, [needsGps, pathname, router, searchParams]);

  return null;
}

export function ProductListLocationDeniedBanner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const retry = () => {
    const sp = new URLSearchParams(searchParams.toString());
    sp.delete(LOCATION_DENIED_PARAM);
    sp.delete("page");
    router.replace(`${pathname}?${sp.toString()}`);
  };

  return (
    <div className="rounded border border-[#868686] bg-[#3a3a3a] px-4 py-3 font-sans text-sm text-[#f5f5f5]">
      <p>주변 상품을 보려면 위치 권한을 허용해 주세요.</p>
      <button
        type="button"
        onClick={retry}
        className="mt-2 text-vh-brand-gold underline underline-offset-2"
      >
        위치 권한 다시 요청
      </button>
    </div>
  );
}

export function ProductListLocationControls({
  locationState,
  filterOpts,
  variant,
}: ProductListLocationControlsProps) {
  if (locationState.kind !== "ready") return null;

  const { location } = locationState;
  const pcLabel = formatProductListLocationLabel(location);
  const mobileDong = formatProductListLocationDong(location.regionDong);
  const swapHref = buildSwapHref(filterOpts, location);
  const canSwap = Boolean(swapHref);

  if (variant === "desktop") {
    return (
      <div className="pt-10">
        <p className="font-sans text-xs text-[#ababab]">내 위치</p>
        {canSwap && swapHref ? (
          <Link
            href={swapHref}
            className="mt-2 flex w-full items-center justify-between font-sans text-2xl leading-9 text-vh-gray-100"
          >
            <span>{pcLabel}</span>
            <Icon name="swap" size={24} className="text-[#ababab]" />
          </Link>
        ) : (
          <div className="mt-2 flex w-full items-center justify-between font-sans text-2xl leading-9 text-vh-gray-100">
            <span>{pcLabel}</span>
            {canSwap ? (
              <Icon
                name="swap"
                size={24}
                className="text-[#ababab] opacity-30"
              />
            ) : null}
          </div>
        )}
      </div>
    );
  }

  if (!mobileDong) return null;

  if (canSwap && swapHref) {
    return (
      <Link
        href={swapHref}
        className="flex items-center gap-0.5 rounded-[5px] border border-[#868686] px-2 py-1 font-sans text-xs text-vh-gray-100"
      >
        <Icon name="location-pin" size={10} className="text-vh-gray-100" />
        <span>{mobileDong}</span>
        <Icon name="swap" size={10} className="text-[#ababab]" />
      </Link>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-0.5 rounded-[5px] border border-[#868686] px-2 py-1 font-sans text-xs text-vh-gray-100"
      )}
    >
      <Icon name="location-pin" size={10} className="text-vh-gray-100" />
      <span>{mobileDong}</span>
    </div>
  );
}
