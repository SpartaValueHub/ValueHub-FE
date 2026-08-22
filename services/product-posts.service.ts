/**
 * product-post-service 오케스트레이션.
 * UI/actions → service → lib/api (3-layer).
 */
import {
  ALL_CATEGORY_NAV_ID,
} from "@/constants/categories";
import {
  createProductPost,
  deleteProductPost,
  getProductPostDetail,
  listProductPosts,
} from "@/lib/api/product-posts";
import {
  listChildCategoriesService,
  listLeafCategoriesService,
  listRootCategoriesService,
} from "@/services/categories.service";
import type {
  ApiCreateProductPostRequest,
  ApiProductPostCard,
  ApiProductPostDetail,
} from "@/types/product-posts/api";
import type { UiCategorySummary } from "@/types/categories/ui";
import type {
  UiProductPostCard,
  UiProductPostCardPage,
  UiProductPostDetail,
  UiProductPostDocument,
  UiProductPostImage,
} from "@/types/product-posts/ui";

function mapImage(api: ApiProductPostDetail["images"][number]): UiProductPostImage {
  return {
    uuid: api.productPostImageUuid,
    url: api.imageUrl,
    sortOrder: api.sortOrder,
  };
}

function mapDocument(
  api: ApiProductPostDetail["documents"][number]
): UiProductPostDocument {
  return {
    uuid: api.productPostDocumentUuid,
    type: api.documentType,
    url: api.imageUrl,
  };
}

export function mapProductPostDetail(
  api: ApiProductPostDetail
): UiProductPostDetail {
  return {
    productPostUuid: api.productPostUuid,
    memberUuid: api.memberUuid,
    categoryUuid: api.categoryUuid,
    name: api.productPostName,
    conditionGrade: api.conditionGrade,
    price: api.price,
    description: api.description,
    tradeStatus: api.tradeStatus,
    latitude: api.latitude,
    longitude: api.longitude,
    placeName: api.placeName,
    bumpedAt: api.bumpedAt,
    createdAt: api.createdAt,
    images: [...api.images].sort((a, b) => a.sortOrder - b.sortOrder).map(mapImage),
    documents: api.documents.map(mapDocument),
  };
}

function mapCard(api: ApiProductPostCard): UiProductPostCard {
  return {
    productPostUuid: api.productPostUuid,
    name: api.productPostName,
    price: api.price,
    tradeStatus: api.tradeStatus,
    listedAt: api.listedAt,
    thumbnailUrl: api.thumbnailUrl,
  };
}

export async function getProductPostDetailService(
  uuid: string
): Promise<UiProductPostDetail> {
  const api = await getProductPostDetail(uuid);
  return mapProductPostDetail(api);
}

export async function listProductPostsService(
  params?: Record<string, string | string[]>
): Promise<UiProductPostCardPage> {
  const api = await listProductPosts(params);
  return {
    items: api.content.map(mapCard),
    page: api.page,
    size: api.size,
    totalElements: api.totalElements,
    totalPages: api.totalPages,
  };
}

export async function createProductPostService(
  body: ApiCreateProductPostRequest
): Promise<UiProductPostDetail> {
  const api = await createProductPost(body);
  return mapProductPostDetail(api);
}

export async function deleteProductPostService(uuid: string): Promise<void> {
  await deleteProductPost(uuid);
}

export const PRODUCT_POST_LIST_PAGE_SIZE = 20;

export type UiBrandFilterOption = {
  /** 표시명 — 동일 이름이 여러 중분류에 있으면 하나로 묶음 */
  name: string;
  /** 같은 이름의 리프 UUID들 (선택 시 전부 categoryUuids로 전달) */
  categoryUuids: string[];
};

export type UiProductPostListContext = {
  title: string;
  rootUuid: string | null;
  children: UiCategorySummary[];
  /** 현재 범위의 브랜드 — 이름 기준 중복 제거 */
  brands: UiBrandFilterOption[];
  categoryUuids: string[] | undefined;
  activeSub: string | null;
};

/** 목록 API는 리프 UUID만 받음. 중분류면 하위 리프, 리프면 자기 UUID */
async function leavesForParent(
  parentUuid: string
): Promise<UiCategorySummary[]> {
  return (await listLeafCategoriesService(parentUuid)).filter(
    (item) => item.active
  );
}

/** 동일 브랜드명이 가방/주얼리 등에 각각 있으면 UI에선 한 줄로 */
function dedupeBrandsByName(leaves: UiCategorySummary[]): UiBrandFilterOption[] {
  const byName = new Map<string, string[]>();
  for (const leaf of leaves) {
    const key = leaf.categoryName.trim();
    if (!key) continue;
    const uuids = byName.get(key) ?? [];
    if (!uuids.includes(leaf.categoryUuid)) {
      uuids.push(leaf.categoryUuid);
    }
    byName.set(key, uuids);
  }
  return Array.from(byName.entries()).map(([name, categoryUuids]) => ({
    name,
    categoryUuids,
  }));
}

export async function resolveProductPostListContext(
  categoryParam?: string | null,
  subParam?: string | null
): Promise<UiProductPostListContext> {
  const categoryUuid = categoryParam?.trim() || null;
  const subUuid = subParam?.trim() || null;

  if (!categoryUuid || categoryUuid === ALL_CATEGORY_NAV_ID) {
    return {
      title: "All",
      rootUuid: null,
      children: [],
      brands: [],
      categoryUuids: undefined,
      activeSub: null,
    };
  }

  try {
    const roots = await listRootCategoriesService();
    const root = roots.find((item) => item.categoryUuid === categoryUuid);

    if (root) {
      const children = (await listChildCategoriesService(root.categoryUuid)).filter(
        (item) => item.active
      );
      const brandParent = subUuid ?? root.categoryUuid;
      const leaves = await leavesForParent(brandParent);
      const brands = dedupeBrandsByName(leaves);
      const allLeafUuids = leaves.map((b) => b.categoryUuid);

      if (subUuid) {
        return {
          title: root.categoryName,
          rootUuid: root.categoryUuid,
          children,
          brands,
          categoryUuids: allLeafUuids.length > 0 ? allLeafUuids : [subUuid],
          activeSub: subUuid,
        };
      }

      return {
        title: root.categoryName,
        rootUuid: root.categoryUuid,
        children,
        brands,
        categoryUuids:
          allLeafUuids.length > 0 ? allLeafUuids : [root.categoryUuid],
        activeSub: null,
      };
    }

    for (const candidate of roots) {
      const children = (await listChildCategoriesService(
        candidate.categoryUuid
      )).filter((item) => item.active);
      const match = children.find((item) => item.categoryUuid === categoryUuid);
      if (match) {
        const leaves = await leavesForParent(categoryUuid);
        const brands = dedupeBrandsByName(leaves);
        const allLeafUuids = leaves.map((b) => b.categoryUuid);
        return {
          title: candidate.categoryName,
          rootUuid: candidate.categoryUuid,
          children,
          brands,
          categoryUuids:
            allLeafUuids.length > 0 ? allLeafUuids : [categoryUuid],
          activeSub: categoryUuid,
        };
      }
    }
  } catch {
    /* category-service 실패 시 UUID만 넘김 */
  }

  return {
    title: "상품 목록",
    rootUuid: categoryUuid,
    children: [],
    brands: [],
    categoryUuids: [categoryUuid],
    activeSub: subUuid,
  };
}
