"use server";

/**
 * Product-Post Server Actions.
 * 클라이언트는 이 Action만 호출 — lib/api·services 직접 import 금지.
 */
import { ApiError, ApiTimeoutError, AuthSessionExpiredError } from "@/lib/api/client";
import {
  createProductPostService,
  getProductPostDetailService,
  listProductPostsService,
} from "@/services/product-posts.service";
import type { ApiCreateProductPostRequest } from "@/types/product-posts/api";
import type {
  UiProductPostCardPage,
  UiProductPostDetail,
} from "@/types/product-posts/ui";

export type ProductPostActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; message: string };

function toErrorMessage(e: unknown, fallback: string) {
  if (e instanceof ApiTimeoutError) {
    return "서버 응답이 지연되고 있습니다. 잠시 후 다시 시도해 주세요.";
  }
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

export async function createProductPostAction(
  body: ApiCreateProductPostRequest
): Promise<ProductPostActionResult<UiProductPostDetail>> {
  try {
    const data = await createProductPostService(body);
    return { ok: true, data };
  } catch (e) {
    if (e instanceof AuthSessionExpiredError) {
      return { ok: false, message: e.message };
    }
    return {
      ok: false,
      message: toErrorMessage(e, "상품 등록에 실패했습니다."),
    };
  }
}
