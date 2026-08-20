import { ALL_CATEGORY_NAV_ID } from "@/constants/categories";

/** product-post 목록 경로 — listing 네이밍 사용 금지 */
export const PRODUCT_POSTS_PATH = "/product-posts";

export function productPostsHref(categoryId?: string | null) {
  if (!categoryId || categoryId === ALL_CATEGORY_NAV_ID) {
    return PRODUCT_POSTS_PATH;
  }
  return `${PRODUCT_POSTS_PATH}?category=${encodeURIComponent(categoryId)}`;
}
