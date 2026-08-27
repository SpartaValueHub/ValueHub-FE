/**
 * Product-Post-Service API DTO (lib/api 전용).
 * BE ProductPostSummaryResponseVo / ProductPostCardResponseVo 와 1:1.
 */

export interface ApiProductPostImage {
  productPostImageUuid: string;
  imageUrl: string;
  sortOrder: number;
}

export type ApiProductPostDocumentType =
  "WARRANTY" | "RECEIPT" | "APPRAISAL" | "OTHER";

export interface ApiProductPostDocument {
  productPostDocumentUuid: string;
  documentType: ApiProductPostDocumentType;
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
  /** 거래 희망 동 — 상세/등록·수정 응답 */
  regionDong: string | null;
  /** 거래 희망 구 */
  regionGu: string | null;
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
  /** 거래 희망 동 — FE 표시 1순위 */
  regionDong: string | null;
  /** 거래 희망 구 — FE 표시 2순위 */
  regionGu: string | null;
  /** 거래 희망 장소명 — FE 표시 3순위 */
  placeName: string;
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
  documentType: ApiProductPostDocumentType;
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
  /** 거래 희망 동 — 선택 */
  regionDong?: string | null;
  /** 거래 희망 구 — 선택 */
  regionGu?: string | null;
  images: ApiCreateProductPostImage[];
  /** 최소 1개. 유형별 최대 2 · 합계 최대 8 */
  documents: ApiCreateProductPostDocument[];
}

/** PUT body — 등록과 동일. images/documents는 전체 교체 */
export type ApiUpdateProductPostRequest = ApiCreateProductPostRequest;

/** PATCH /api/v1/product-posts/{uuid}/trade-status */
export interface ApiUpdateTradeStatusRequest {
  tradeStatus: TradeStatus;
}
