import {
  ALL_CATEGORY_NAV_ID,
  HEADER_ROOT_CATEGORY_UUIDS,
} from "@/constants/categories";

/** product-post 목록 경로 — listing 네이밍 사용 금지 */
export const PRODUCT_POSTS_PATH = "/product-posts";

/** 가격 필터 하한 (원) — BE 최소가 정책과 동일 */
export const PRODUCT_POST_PRICE_FILTER_MIN_WON = 500_000;

/** 가격 필터 상한 (원). 이 값이면 maxPrice 미전달 = 「1000만원 이상」 */
export const PRODUCT_POST_PRICE_FILTER_MAX_WON = 10_000_000;

export const PRODUCT_POST_DOCUMENT_TYPES = [
  "WARRANTY",
  "RECEIPT",
  "APPRAISAL",
] as const;

export type ProductPostDocumentFilter = "attached" | "all";

export type ProductPostConditionGrade = "S" | "A" | "B" | "C";

const HEADER_NAV_ROOT_KEY: Record<
  string,
  keyof typeof HEADER_ROOT_CATEGORY_UUIDS
> = {
  luxury: "Luxury",
  collectibles: "Collectibles",
  premium: "Premium",
  electrics: "Electrics",
};

export function productPostsHref(categoryId?: string | null) {
  if (!categoryId || categoryId === ALL_CATEGORY_NAV_ID) {
    return PRODUCT_POSTS_PATH;
  }
  return `${PRODUCT_POSTS_PATH}?category=${encodeURIComponent(categoryId)}`;
}

/** 공통 헤더 All/Luxury… → 목록 URL */
export function headerCategoryNavHref(navId: string) {
  if (!navId || navId === "all" || navId === ALL_CATEGORY_NAV_ID) {
    return productPostsHref();
  }
  const key = HEADER_NAV_ROOT_KEY[navId];
  if (!key) return productPostsHref();
  return productPostsHref(HEADER_ROOT_CATEGORY_UUIDS[key]);
}

export function headerCategoryNavIdFromUuid(categoryUuid: string | null) {
  if (!categoryUuid) return "all";
  const match = (
    Object.entries(HEADER_ROOT_CATEGORY_UUIDS) as [
      keyof typeof HEADER_ROOT_CATEGORY_UUIDS,
      string,
    ][]
  ).find(([, uuid]) => uuid === categoryUuid);
  return match ? match[0].toLowerCase() : "all";
}

export type ProductPostsListHrefOpts = {
  category?: string | null;
  sub?: string | null;
  page?: number;
  /** 브랜드(리프) UUID */
  brands?: string[] | null;
  /** 최대 가격(원). 상한이면 URL에서 생략 */
  maxPrice?: number | null;
  grades?: ProductPostConditionGrade[] | null;
  /** attached = 서류 있는 글, all/미지정 = 서류 필터 없음 */
  docs?: ProductPostDocumentFilter | null;
};

export function productPostsListHref(opts: ProductPostsListHrefOpts) {
  const sp = new URLSearchParams();
  if (opts.category && opts.category !== ALL_CATEGORY_NAV_ID) {
    sp.set("category", opts.category);
  }
  if (opts.sub) {
    sp.set("sub", opts.sub);
  }
  if (opts.page && opts.page > 1) {
    sp.set("page", String(opts.page));
  }
  for (const brand of opts.brands ?? []) {
    if (brand) sp.append("brand", brand);
  }
  if (
    opts.maxPrice != null &&
    opts.maxPrice >= PRODUCT_POST_PRICE_FILTER_MIN_WON &&
    opts.maxPrice < PRODUCT_POST_PRICE_FILTER_MAX_WON
  ) {
    sp.set("maxPrice", String(opts.maxPrice));
  }
  for (const grade of opts.grades ?? []) {
    sp.append("grade", grade);
  }
  if (opts.docs === "attached") {
    sp.set("docs", "attached");
  }
  const qs = sp.toString();
  return qs ? `${PRODUCT_POSTS_PATH}?${qs}` : PRODUCT_POSTS_PATH;
}

export function parseGradeParams(
  raw: string | string[] | undefined
): ProductPostConditionGrade[] {
  const values = Array.isArray(raw) ? raw : raw ? [raw] : [];
  const allowed = new Set<ProductPostConditionGrade>(["S", "A", "B", "C"]);
  return values
    .flatMap((v) => v.split(","))
    .map((v) => v.trim().toUpperCase())
    .filter((v): v is ProductPostConditionGrade =>
      allowed.has(v as ProductPostConditionGrade)
    );
}

export function parseBrandParams(
  raw: string | string[] | undefined
): string[] {
  const values = Array.isArray(raw) ? raw : raw ? [raw] : [];
  return values
    .flatMap((v) => v.split(","))
    .map((v) => v.trim())
    .filter(Boolean);
}
