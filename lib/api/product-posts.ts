import { apiFetch, getProductPostApiUrl } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type {
  ApiMediaPresignedRequest,
  ApiMediaPresignedResponse,
} from "@/types/media/api";
import type {
  ApiCreateProductPostRequest,
  ApiProductPostCardPage,
  ApiProductPostDetail,
  ApiUpdateProductPostRequest,
  ApiUpdateTradeStatusRequest,
} from "@/types/product-posts/api";

/** product-post-service HTTP — lib/api/* 전용. UI·actions에서 import 금지. */

export type ListProductPostsOptions = {
  /** 로그인 검색자 — Gateway public 목록은 JWT를 안 타므로 FE 서버가 주입 */
  searcherMemberUuid?: string;
  /** 비로그인 동시검색 — X-Search-Session-Id */
  searchSessionId?: string;
};

function productPostFetch<T>(
  path: string,
  options?: { headers?: Record<string, string> }
) {
  return apiFetch<T>(path, {
    method: "GET",
    baseUrl: getProductPostApiUrl(),
    cache: { noStore: true },
    skipSessionRecovery: true,
    headers: options?.headers,
  });
}

function searchCoOccurrenceHeaders(opts?: ListProductPostsOptions) {
  const headers: Record<string, string> = {};
  const member = opts?.searcherMemberUuid?.trim();
  const session = opts?.searchSessionId?.trim();
  if (member) headers["X-Member-Uuid"] = member;
  if (session) headers["X-Search-Session-Id"] = session;
  return Object.keys(headers).length > 0 ? headers : undefined;
}

export function getProductPostDetail(uuid: string) {
  return productPostFetch<ApiProductPostDetail>(
    API_ENDPOINTS.productPosts.detail(uuid)
  );
}

export function listProductPosts(
  params?: Record<string, string | string[]>,
  options?: ListProductPostsOptions
) {
  return productPostFetch<ApiProductPostCardPage>(
    API_ENDPOINTS.productPosts.list(params),
    { headers: searchCoOccurrenceHeaders(options) }
  );
}

export function createProductPost(body: ApiCreateProductPostRequest) {
  return apiFetch<ApiProductPostDetail>(API_ENDPOINTS.productPosts.create, {
    method: "POST",
    body,
    baseUrl: getProductPostApiUrl(),
    cache: { noStore: true },
    /** Gateway·BE 지연 시 UI가 무한 대기하지 않도록 */
    timeoutMillis: 12_000,
  });
}

/** POST /product-posts/media/presigned-url */
export function createProductPostMediaPresignedUrl(
  body: ApiMediaPresignedRequest
) {
  return apiFetch<ApiMediaPresignedResponse>(
    API_ENDPOINTS.productPosts.mediaPresignedUrl,
    {
      method: "POST",
      body,
      baseUrl: getProductPostApiUrl(),
      cache: { noStore: true },
      timeoutMillis: 8_000,
    }
  );
}

/** PUT — 본인 + SELLING만. images/documents 전체 교체 */
export function updateProductPost(
  uuid: string,
  body: ApiUpdateProductPostRequest
) {
  return apiFetch<ApiProductPostDetail>(
    API_ENDPOINTS.productPosts.update(uuid),
    {
      method: "PUT",
      body,
      baseUrl: getProductPostApiUrl(),
      cache: { noStore: true },
      timeoutMillis: 12_000,
    }
  );
}

/** Soft Delete — 204 No Content */
export async function deleteProductPost(uuid: string): Promise<void> {
  await apiFetch<null>(API_ENDPOINTS.productPosts.delete(uuid), {
    method: "DELETE",
    baseUrl: getProductPostApiUrl(),
    cache: { noStore: true },
    timeoutMillis: 12_000,
  });
}

/** POST — 본인 + SELLING + PUBLIC. 쿨다운·일일 한도 BE 검증 */
export function bumpProductPost(uuid: string) {
  return apiFetch<ApiProductPostDetail>(API_ENDPOINTS.productPosts.bump(uuid), {
    method: "POST",
    baseUrl: getProductPostApiUrl(),
    cache: { noStore: true },
    timeoutMillis: 12_000,
  });
}

/** PATCH — 판매자 본인. SELLING↔RESERVED, RESERVED/SELLING→SOLD_OUT */
export function updateProductPostTradeStatus(
  uuid: string,
  body: ApiUpdateTradeStatusRequest
) {
  return apiFetch<ApiProductPostDetail>(
    API_ENDPOINTS.productPosts.tradeStatus(uuid),
    {
      method: "PATCH",
      body,
      baseUrl: getProductPostApiUrl(),
      cache: { noStore: true },
      timeoutMillis: 12_000,
    }
  );
}
