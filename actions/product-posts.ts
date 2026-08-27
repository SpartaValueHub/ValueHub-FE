"use server";

/**
 * Product-Post Server Actions.
 * 클라이언트는 이 Action만 호출 — lib/api·services 직접 import 금지.
 */
import {
  ApiError,
  ApiTimeoutError,
  AuthSessionExpiredError,
} from "@/lib/api/client";
import { mapActionError } from "@/lib/auth/map-action-error";
import { requireActionAuth } from "@/lib/session";
import {
  bumpProductPostService,
  createProductPostService,
  createProductPostMediaPresignedUrlService,
  deleteProductPostService,
  getProductPostDetailService,
  listProductPostsService,
  updateProductPostService,
  updateProductPostTradeStatusService,
} from "@/services/product-posts.service";
import type {
  ApiCreateProductPostRequest,
  ApiUpdateProductPostRequest,
  TradeStatus,
} from "@/types/product-posts/api";
import type {
  UiProductPostCardPage,
  UiProductPostDetail,
} from "@/types/product-posts/ui";
import { mediaPresignedInputSchema } from "@/types/media/presign";
import type { UiMediaPresigned } from "@/types/media/ui";

export type ProductPostActionResult<T> =
  | { ok: true; data: T }
  | {
      ok: false;
      message: string;
      code?: string;
      fieldErrors?: Record<string, string[]>;
    };

function toErrorResult(e: unknown, fallback: string) {
  if (e instanceof ApiTimeoutError) {
    return {
      ok: false as const,
      message: "서버 응답이 지연되고 있습니다. 잠시 후 다시 시도해 주세요.",
    };
  }
  if (e instanceof ApiError) {
    return {
      ok: false as const,
      message: e.message,
      code: e.code,
      fieldErrors: e.fieldErrors,
    };
  }
  if (e instanceof Error) {
    return { ok: false as const, message: e.message };
  }
  return { ok: false as const, message: fallback };
}

export async function getProductPostDetailAction(
  uuid: string
): Promise<ProductPostActionResult<UiProductPostDetail>> {
  try {
    const data = await getProductPostDetailService(uuid);
    return { ok: true, data };
  } catch (e) {
    return toErrorResult(e, "상품 정보를 불러오지 못했습니다.");
  }
}

export async function listProductPostsAction(
  params?: Record<string, string | string[]>
): Promise<ProductPostActionResult<UiProductPostCardPage>> {
  try {
    const data = await listProductPostsService(params);
    return { ok: true, data };
  } catch (e) {
    return toErrorResult(e, "상품 목록을 불러오지 못했습니다.");
  }
}

export async function createProductPostAction(
  body: ApiCreateProductPostRequest
): Promise<ProductPostActionResult<UiProductPostDetail>> {
  try {
    await requireActionAuth();
    const data = await createProductPostService(body);
    return { ok: true, data };
  } catch (e) {
    if (e instanceof AuthSessionExpiredError) {
      return mapActionError(e, "상품 등록에 실패했습니다.");
    }
    return toErrorResult(e, "상품 등록에 실패했습니다.");
  }
}

export async function updateProductPostAction(
  uuid: string,
  body: ApiUpdateProductPostRequest
): Promise<ProductPostActionResult<UiProductPostDetail>> {
  try {
    await requireActionAuth();
    const data = await updateProductPostService(uuid, body);
    return { ok: true, data };
  } catch (e) {
    if (e instanceof AuthSessionExpiredError) {
      return mapActionError(e, "상품 수정에 실패했습니다.");
    }
    return toErrorResult(e, "상품 수정에 실패했습니다.");
  }
}

export async function deleteProductPostAction(
  uuid: string
): Promise<ProductPostActionResult<null>> {
  try {
    await requireActionAuth();
    await deleteProductPostService(uuid);
    return { ok: true, data: null };
  } catch (e) {
    if (e instanceof AuthSessionExpiredError) {
      return mapActionError(e, "상품 삭제에 실패했습니다.");
    }
    return toErrorResult(e, "상품 삭제에 실패했습니다.");
  }
}

export async function bumpProductPostAction(
  uuid: string
): Promise<ProductPostActionResult<UiProductPostDetail>> {
  try {
    await requireActionAuth();
    const data = await bumpProductPostService(uuid);
    return { ok: true, data };
  } catch (e) {
    if (e instanceof AuthSessionExpiredError) {
      return mapActionError(e, "끌어올리기에 실패했습니다.");
    }
    return toErrorResult(e, "끌어올리기에 실패했습니다.");
  }
}

export async function updateProductPostTradeStatusAction(
  uuid: string,
  tradeStatus: TradeStatus
): Promise<ProductPostActionResult<UiProductPostDetail>> {
  try {
    await requireActionAuth();
    const data = await updateProductPostTradeStatusService(uuid, tradeStatus);
    return { ok: true, data };
  } catch (e) {
    if (e instanceof AuthSessionExpiredError) {
      return mapActionError(e, "거래 상태 변경에 실패했습니다.");
    }
    return toErrorResult(e, "거래 상태 변경에 실패했습니다.");
  }
}

export async function createProductPostMediaPresignedUrlAction(
  input: unknown
): Promise<ProductPostActionResult<UiMediaPresigned>> {
  const parsed = mediaPresignedInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message:
        parsed.error.issues[0]?.message ?? "이미지 정보가 올바르지 않습니다.",
    };
  }

  try {
    await requireActionAuth();
    const data = await createProductPostMediaPresignedUrlService(parsed.data);
    return { ok: true, data };
  } catch (e) {
    if (e instanceof AuthSessionExpiredError) {
      return mapActionError(e, "이미지 업로드 주소를 받지 못했습니다.");
    }
    return toErrorResult(e, "이미지 업로드 주소를 받지 못했습니다.");
  }
}
