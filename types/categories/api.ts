/**
 * Category-Service API DTO (lib/api 전용).
 * BE CategorySummaryResponseVo 와 1:1.
 */

export interface ApiCategorySummary {
  categoryUuid: string;
  categoryName: string;
  parentUuid: string | null;
  sortOrder: number;
  depth: number;
  active: boolean;
}
