/**
 * product-post-service 오케스트레이션.
 * UI/actions → service → lib/api (3-layer).
 */
import {
  getProductPostDetail,
  listProductPosts,
} from "@/lib/api/product-posts";
import type {
  ApiProductPostCard,
  ApiProductPostDetail,
} from "@/types/product-posts/api";
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
