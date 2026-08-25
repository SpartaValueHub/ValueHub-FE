import { apiFetch, getProductPostApiUrl } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type {
  ApiCreateProductPostRequest,
  ApiProductPostCardPage,
  ApiProductPostDetail,
  ApiUpdateProductPostRequest,
} from "@/types/product-posts/api";

/** product-post-service HTTP — lib/api/* 전용. UI·actions에서 import 금지. */

function productPostFetch<T>(path: string) {
  return apiFetch<T>(path, {
    method: "GET",
    baseUrl: getProductPostApiUrl(),
    cache: { noStore: true },
    skipSessionRecovery: true,
  });
}

export function getProductPostDetail(uuid: string) {
  return productPostFetch<ApiProductPostDetail>(
    API_ENDPOINTS.productPosts.detail(uuid)
  );
}

export function listProductPosts(params?: Record<string, string | string[]>) {
  return productPostFetch<ApiProductPostCardPage>(
    API_ENDPOINTS.productPosts.list(params)
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
