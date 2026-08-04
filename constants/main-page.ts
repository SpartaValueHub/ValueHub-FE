/** 메인 페이지 카테고리 — BE 미연동, 하드코딩 */
export type MainCategoryItem = {
  id: string;
  title: string;
  description: string;
};

export const MAIN_CATEGORY_ROWS: MainCategoryItem[][] = [
  [
    { id: "all", title: "All", description: "전체 상품 보기" },
    {
      id: "luxury",
      title: "Luxury",
      description: "명품·시계·주얼리",
    },
  ],
  [
    {
      id: "collectibles",
      title: "Collectibles",
      description: "한정판·피규어·굿즈",
    },
    {
      id: "premium",
      title: "Premium",
      description: "미술품·골동품·희귀소장품",
    },
    {
      id: "electrics",
      title: "Electrics",
      description: "카메라·렌즈·오디오",
    },
  ],
];

export const MAIN_CATEGORY_PLACEHOLDER = "카테고리";

export const MAIN_SEARCH_PLACEHOLDER = "검색어를 입력하세요.";

export const MAIN_SLOGAN = "신뢰가 거래의 기준입니다.";
