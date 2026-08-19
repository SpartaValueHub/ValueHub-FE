/**
 * Category UI 모델 — components / services 매핑 결과.
 */

export interface UiCategorySummary {
  categoryUuid: string;
  categoryName: string;
  parentUuid: string | null;
  sortOrder: number;
  depth: number;
  active: boolean;
}

/** 헤더 네비 항목 (FE 가상 All 포함) */
export interface UiCategoryNavItem {
  /** `all` 또는 categoryUuid */
  id: string;
  label: string;
  /** 실제 카테고리면 uuid, All이면 null */
  categoryUuid: string | null;
}
