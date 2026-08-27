import { ProductPostListTemplate } from "@/components/templates/listing/ProductPostListTemplate";
import {
  PRODUCT_POST_DOCUMENT_TYPES,
  PRODUCT_POST_PRICE_FILTER_MAX_WON,
  PRODUCT_POST_PRICE_FILTER_MIN_WON,
  parseBrandParams,
  parseGradeParams,
} from "@/constants/product-posts";
import { resolveSearchCoOccurrenceHeaders } from "@/lib/search/co-occurrence";
import {
  PRODUCT_POST_LIST_PAGE_SIZE,
  listProductPostsService,
  resolveProductPostListContext,
} from "@/services/product-posts.service";
import type { ProductPostDocumentFilter } from "@/constants/product-posts";
import type { UiProductPostCardPage } from "@/types/product-posts/ui";

interface ProductPostsPageProps {
  searchParams: Promise<{
    category?: string;
    sub?: string;
    page?: string;
    brand?: string | string[];
    maxPrice?: string;
    grade?: string | string[];
    docs?: string;
    keyword?: string;
  }>;
}

const EMPTY_LIST: UiProductPostCardPage = {
  items: [],
  page: 1,
  size: PRODUCT_POST_LIST_PAGE_SIZE,
  totalElements: 0,
  totalPages: 0,
};

function allowedBrandUuids(brands: { categoryUuids: string[] }[]): Set<string> {
  return new Set(brands.flatMap((b) => b.categoryUuids));
}

export default async function ProductPostsPage({
  searchParams,
}: ProductPostsPageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const keyword = params.keyword?.trim() || "";
  const context = await resolveProductPostListContext(
    params.category,
    params.sub
  );

  const allowed = allowedBrandUuids(context.brands);
  const selectedBrands = parseBrandParams(params.brand).filter((uuid) =>
    allowed.has(uuid)
  );
  const selectedGrades = parseGradeParams(params.grade);
  const docs: ProductPostDocumentFilter =
    params.docs === "attached" ? "attached" : "all";

  const parsedMax = Number.parseInt(params.maxPrice ?? "", 10);
  const maxPrice =
    Number.isFinite(parsedMax) && parsedMax >= PRODUCT_POST_PRICE_FILTER_MIN_WON
      ? Math.min(parsedMax, PRODUCT_POST_PRICE_FILTER_MAX_WON)
      : PRODUCT_POST_PRICE_FILTER_MAX_WON;

  const listParams: Record<string, string | string[]> = {
    page: String(page),
    size: String(PRODUCT_POST_LIST_PAGE_SIZE),
    minPrice: String(PRODUCT_POST_PRICE_FILTER_MIN_WON),
  };

  if (keyword) {
    listParams.keyword = keyword;
  }

  if (selectedBrands.length > 0) {
    listParams.categoryUuids = selectedBrands;
  } else if (context.categoryUuids?.length) {
    listParams.categoryUuids = context.categoryUuids;
  }

  if (maxPrice < PRODUCT_POST_PRICE_FILTER_MAX_WON) {
    listParams.maxPrice = String(maxPrice);
  }
  if (selectedGrades.length > 0) {
    listParams.conditionGrades = selectedGrades;
  }
  if (docs === "attached") {
    listParams.documentTypes = [...PRODUCT_POST_DOCUMENT_TYPES];
  }

  let list = EMPTY_LIST;
  let errorMessage: string | undefined;
  try {
    const searchHeaders = keyword
      ? await resolveSearchCoOccurrenceHeaders()
      : undefined;
    list = await listProductPostsService(listParams, searchHeaders);
  } catch {
    errorMessage = "상품 목록을 불러오지 못했습니다.";
  }

  return (
    <ProductPostListTemplate
      title={keyword ? `"${keyword}" 검색 결과` : context.title}
      categoryUuid={context.rootUuid}
      subCategories={context.children}
      brands={context.brands}
      activeSub={context.activeSub}
      selectedBrands={selectedBrands}
      maxPrice={maxPrice}
      selectedGrades={selectedGrades}
      docs={docs}
      keyword={keyword || null}
      list={list}
      errorMessage={errorMessage}
    />
  );
}
