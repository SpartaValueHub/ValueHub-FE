"use server";

import { cookies } from "next/headers";

import {
  GUEST_LIST_CENTER_LAT_COOKIE,
  GUEST_LIST_CENTER_LNG_COOKIE,
} from "@/lib/product-posts/list-center-params";

const COOKIE_MAX_AGE_SEC = 60 * 60 * 24;

/** 비회원 GPS center — 상세 nearby 등 페이지 간 유지 */
export async function setGuestListCenterAction(
  centerLatitude: number,
  centerLongitude: number
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!Number.isFinite(centerLatitude) || !Number.isFinite(centerLongitude)) {
    return { ok: false, message: "유효하지 않은 좌표입니다." };
  }

  const jar = await cookies();
  jar.set(GUEST_LIST_CENTER_LAT_COOKIE, String(centerLatitude), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE_SEC,
  });
  jar.set(GUEST_LIST_CENTER_LNG_COOKIE, String(centerLongitude), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE_SEC,
  });

  return { ok: true };
}
