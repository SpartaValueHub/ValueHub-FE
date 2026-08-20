/** 헤더·목록용 FE 가상 항목 — Category-Service에 row 없음 */
export const ALL_CATEGORY_NAV_ID = "all" as const;

/**
 * category-service 401 등으로 BE 목록을 못 받을 때 헤더용 대분류 uuid.
 * Category-Service seed depth0 와 동기화 (slug URL 사용 금지).
 */
export const HEADER_ROOT_CATEGORY_UUIDS = {
  Luxury: "b8af7802-9b8e-11f1-ab2d-2acd4ab64947",
  Collectibles: "b8b03f88-9b8e-11f1-ab2d-2acd4ab64947",
  Premium: "b8b10cc0-9b8e-11f1-ab2d-2acd4ab64947",
  Electrics: "b8b1c848-9b8e-11f1-ab2d-2acd4ab64947",
} as const;
