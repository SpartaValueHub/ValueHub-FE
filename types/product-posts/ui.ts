/**
 * Product-Post UI 모델 — components / services 매핑 결과.
 */

export interface UiProductPostImage {
  uuid: string;
  url: string;
  sortOrder: number;
}

export type DocumentType = "WARRANTY" | "RECEIPT" | "APPRAISAL";

export interface UiProductPostDocument {
  uuid: string;
  type: DocumentType;
  url: string;
}

export type ConditionGrade = "S" | "A" | "B" | "C";
export type TradeStatus = "SELLING" | "RESERVED" | "SOLD_OUT";

export interface UiProductPostDetail {
  productPostUuid: string;
  memberUuid: string;
  categoryUuid: string;
  name: string;
  conditionGrade: ConditionGrade;
  price: number;
  description: string;
  tradeStatus: TradeStatus;
  latitude: number | null;
  longitude: number | null;
  placeName: string | null;
  bumpedAt: string | null;
  createdAt: string;
  images: UiProductPostImage[];
  documents: UiProductPostDocument[];
}

export interface UiProductPostCard {
  productPostUuid: string;
  name: string;
  price: number;
  tradeStatus: TradeStatus;
  listedAt: string;
  thumbnailUrl: string | null;
}

export interface UiProductPostCardPage {
  items: UiProductPostCard[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
