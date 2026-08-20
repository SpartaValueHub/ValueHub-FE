"use server";

/**
 * Product-Post Server Actions.
 * 클라이언트는 이 Action만 호출 — lib/api·services 직접 import 금지.
 */
import { ApiError } from "@/lib/api/client";
import {
  getProductPostDetailService,
  listProductPostsService,
} from "@/services/product-posts.service";
import type {
  UiProductPostCardPage,
  UiProductPostDetail,
} from "@/types/product-posts/ui";

export type ProductPostActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; message: string };

function toErrorMessage(e: unknown, fallback: string) {
  if (e instanceof ApiError) return e.message;
  if (e instanceof Error) return e.message;
  return fallback;
}

export async function getProductPostDetailAction(
  uuid: string
): Promise<ProductPostActionResult<UiProductPostDetail>> {
  try {
    const data = await getProductPostDetailService(uuid);
    return { ok: true, data };
  } catch (e) {
    return {
      ok: false,
      message: toErrorMessage(e, "상품 정보를 불러오지 못했습니다."),
    };
  }
}

export async function listProductPostsAction(
  params?: Record<string, string | string[]>
): Promise<ProductPostActionResult<UiProductPostCardPage>> {
  try {
    const data = await listProductPostsService(params);
    return { ok: true, data };
  } catch (e) {
    return {
      ok: false,
      message: toErrorMessage(e, "상품 목록을 불러오지 못했습니다."),
    };
  }
}
