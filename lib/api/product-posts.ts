import { apiFetch, getProductPostApiUrl } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type {
  ApiProductPostCardPage,
  ApiProductPostDetail,
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
