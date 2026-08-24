/**
 * Product-Post-Service API DTO (lib/api 전용).
 * BE ProductPostSummaryResponseVo / ProductPostCardResponseVo 와 1:1.
 */

export interface ApiProductPostImage {
  productPostImageUuid: string;
  imageUrl: string;
  sortOrder: number;
}

export interface ApiProductPostDocument {
  productPostDocumentUuid: string;
  documentType: "WARRANTY" | "RECEIPT" | "APPRAISAL";
  imageUrl: string;
}

export type ConditionGrade = "S" | "A" | "B" | "C";
export type TradeStatus = "SELLING" | "RESERVED" | "SOLD_OUT";
export type ProductPostStatus = "PUBLIC" | "HIDDEN" | "DELETED";

export interface ApiProductPostDetail {
  productPostUuid: string;
  memberUuid: string;
  categoryUuid: string;
  productPostName: string;
  conditionGrade: ConditionGrade;
  price: number;
  description: string;
  tradeStatus: TradeStatus;
  productPostStatus: ProductPostStatus;
  latitude: number | null;
  longitude: number | null;
  placeName: string | null;
  bumpedAt: string | null;
  createdAt: string;
  images: ApiProductPostImage[];
  documents: ApiProductPostDocument[];
}

export interface ApiProductPostCard {
  productPostUuid: string;
  productPostName: string;
  price: number;
  tradeStatus: TradeStatus;
  listedAt: string;
  thumbnailUrl: string | null;
}

export interface ApiProductPostCardPage {
  content: ApiProductPostCard[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

/** POST /api/v1/product-posts · PUT /api/v1/product-posts/{uuid} body (동일) */
export interface ApiCreateProductPostImage {
  imageUrl: string;
}

export interface ApiCreateProductPostDocument {
  documentType: "WARRANTY" | "RECEIPT" | "APPRAISAL";
  imageUrl: string;
}

export interface ApiCreateProductPostRequest {
  categoryUuid: string;
  productPostName: string;
  conditionGrade: ConditionGrade;
  price: number;
  description: string;
  latitude: number;
  longitude: number;
  placeName: string;
  images: ApiCreateProductPostImage[];
  documents?: ApiCreateProductPostDocument[];
}

/** PUT body — 등록과 동일. images/documents는 전체 교체 */
export type ApiUpdateProductPostRequest = ApiCreateProductPostRequest;
