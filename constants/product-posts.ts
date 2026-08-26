import {
  ALL_CATEGORY_NAV_ID,
  HEADER_ROOT_CATEGORY_UUIDS,
} from "@/constants/categories";

/** product-post 목록 경로 — listing 네이밍 사용 금지 */
export const PRODUCT_POSTS_PATH = "/product-posts";

/** 상품 등록 경로 */
export const PRODUCT_POST_CREATE_PATH = `${PRODUCT_POSTS_PATH}/new`;

/** 상품 수정 경로 */
export function productPostEditPath(uuid: string) {
  return `${PRODUCT_POSTS_PATH}/${encodeURIComponent(uuid)}/edit`;
}

/** 등록 최소가 (원) — BE product-post.policy.min-price 기본값과 동일 */
export const PRODUCT_POST_MIN_PRICE_WON = 500_000;

/** 상품명·설명 길이 (BE Create VO) */
export const PRODUCT_POST_NAME_MIN = 2;
export const PRODUCT_POST_NAME_MAX = 100;
export const PRODUCT_POST_DESCRIPTION_MAX = 2000;

/** 상품 사진 장수 */
export const PRODUCT_POST_IMAGE_MIN = 1;
export const PRODUCT_POST_IMAGE_MAX = 10;
export const PRODUCT_POST_IMAGE_MAX_BYTES = 5 * 1024 * 1024;

/**
 * @deprecated S3 Presign 연동 후 미사용. 제출은 CloudFront publicUrl만 사용.
 */
export function productPostPlaceholderImageUrl(index: number) {
  return `https://placehold.co/800x800/png?text=vh-${index + 1}`;
}

/** 지도 연동 전 임시 좌표 (서울시청 일대) */
export const PRODUCT_POST_DEFAULT_LATITUDE = 37.5665;
export const PRODUCT_POST_DEFAULT_LONGITUDE = 126.978;

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
  const rootUuid = headerCategoryRootUuid(navId);
  return rootUuid ? productPostsHref(rootUuid) : productPostsHref();
}

/** 헤더 대분류 navId → category-service root uuid */
export function headerCategoryRootUuid(navId: string) {
  if (!navId || navId === "all" || navId === ALL_CATEGORY_NAV_ID) {
    return null;
  }
  const key = HEADER_NAV_ROOT_KEY[navId];
  return key ? HEADER_ROOT_CATEGORY_UUIDS[key] : null;
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

export function parseBrandParams(raw: string | string[] | undefined): string[] {
  const values = Array.isArray(raw) ? raw : raw ? [raw] : [];
  return values
    .flatMap((v) => v.split(","))
    .map((v) => v.trim())
    .filter(Boolean);
}
