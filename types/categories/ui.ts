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
