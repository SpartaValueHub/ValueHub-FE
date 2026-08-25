"use server";

/**
 * 마이페이지 Server Actions.
 * 판매 목록은 세션 memberUuid만 사용 — 클라이언트 uuid 신뢰 금지.
 */
import {
  ApiError,
  ApiTimeoutError,
  AuthSessionExpiredError,
} from "@/lib/api/client";
import { mapActionError } from "@/lib/auth/map-action-error";
import { requireActionAuth } from "@/lib/session";
import {
  listMySellPostsService,
  type UiMyPageSellStatusFilter,
} from "@/services/mypage.service";
import type { UiMyPageSellListPage } from "@/types/mypage/ui";

export type MyPageActionResult<T> =
  { ok: true; data: T } | { ok: false; message: string; code?: string };

const SELL_FILTERS = new Set<UiMyPageSellStatusFilter>([
  "all",
  "selling",
  "reserved",
  "completed",
]);

function toErrorMessage(e: unknown, fallback: string) {
  if (e instanceof ApiTimeoutError) {
    return "서버 응답이 지연되고 있습니다. 잠시 후 다시 시도해 주세요.";
  }
  if (e instanceof ApiError) return e.message;
  if (e instanceof Error) return e.message;
  return fallback;
}

function normalizeSellFilter(value: string): UiMyPageSellStatusFilter {
  if (SELL_FILTERS.has(value as UiMyPageSellStatusFilter)) {
    return value as UiMyPageSellStatusFilter;
  }
  return "all";
}

/** 내 판매 목록 — 탭/더보기용 (memberUuid는 세션에서만) */
export async function listMySellPostsAction(
  filter: string,
  page = 1
): Promise<MyPageActionResult<UiMyPageSellListPage>> {
  try {
    const user = await requireActionAuth();
    const safePage = Number.isFinite(page) && page >= 1 ? Math.floor(page) : 1;
    const data = await listMySellPostsService(
      user.memberUuid,
      normalizeSellFilter(filter),
      safePage
    );
    return { ok: true, data };
  } catch (e) {
    if (e instanceof AuthSessionExpiredError) {
      return mapActionError(e, "판매 목록을 불러오지 못했습니다.");
    }
    return {
      ok: false,
      message: toErrorMessage(e, "판매 목록을 불러오지 못했습니다."),
    };
  }
}
