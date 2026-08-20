/** 메인 페이지 카테고리 — BE 미연동, 하드코딩 */
export type MainCategoryItem = {
  id: string;
  title: string;
  description: string;
};

export type MainCategoryRow = {
  items: MainCategoryItem[];
};

export const MAIN_CATEGORY_ROWS: MainCategoryRow[] = [
  {
    items: [
      { id: "all", title: "All", description: "전체 상품 보기" },
      {
        id: "luxury",
        title: "Luxury",
        description: "명품·시계·주얼리",
      },
    ],
  },
  {
    items: [
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
  },
];

export type MainCategoryDetail = {
  id: string;
  title: string;
  shortDescription: string;
  descriptions: string[];
  tileImage: string;
  sideImage?: string;
  highlighted?: boolean;
};

export const MAIN_HEADER_NAV: MainCategoryItem[] = [
  { id: "all", title: "All", description: "전체" },
  { id: "luxury", title: "Luxury", description: "명품" },
  { id: "collectibles", title: "Collectibles", description: "컬렉터블" },
  { id: "premium", title: "Premium", description: "프리미엄" },
  { id: "electrics", title: "Electrics", description: "전자기기" },
];

export const MAIN_CATEGORIES: MainCategoryDetail[] = [
  {
    id: "luxury",
    title: "LUXURY",
    shortDescription: "명품·시계·주얼리",
    descriptions: [
      "명품 브랜드의 가방, 시계, 주얼리 등",
      "높은 가치와 뛰어난 품질을 갖춘",
      "럭셔리 아이템을 한곳에서 만나보세요.",
    ],
    tileImage: "/main/categories/luxury-tile.png",
    sideImage: "/main/categories/luxury-side.png",
    highlighted: true,
  },
  {
    id: "collectibles",
    title: "COLLECTIBLES",
    shortDescription: "한정판·피규어·굿즈",
    descriptions: [
      "한정판, 피규어, 희귀 소장품 등",
      "특별한 희소성과 수집 가치를 지닌",
      "다양한 컬렉터 아이템을 만나보세요.",
    ],
    tileImage: "/main/categories/collectibles-tile.png",
  },
  {
    id: "premium",
    title: "PREMIUM",
    shortDescription: "미술품·골동품",
    descriptions: [
      "미술품, 골동품 등 예술적 가치와",
      "역사적 의미를 지닌 작품부터",
      "희소성 높은 프리미엄 아이템까지 만나보세요.",
    ],
    tileImage: "/main/categories/premium-tile.png",
  },
  {
    id: "electrics",
    title: "ELECTRICS",
    shortDescription: "카메라·오디오·전자기기",
    descriptions: [
      "카메라, 오디오, 전자기기 등 뛰어난 성능과",
      "기술력을 갖춘 다양한",
      "프리미엄 전자제품을 만나보세요.",
    ],
    tileImage: "/main/categories/electrics-tile.png",
  },
];

export type RecommendedProduct = {
  id: string;
  name: string;
  image: string;
};

export const MAIN_RECOMMENDED_PRODUCTS: RecommendedProduct[] = [
  {
    id: "1",
    name: "에르메스 파랑돌 펜던트 목걸이",
    image: "/main/products/product-1.png",
  },
  {
    id: "2",
    name: "버버리 레더 포켓 미니 토트백",
    image: "/main/products/product-2.png",
  },
  {
    id: "3",
    name: "티파니앤코 채널 밴드링(백금, 스톤라운 ..",
    image: "/main/products/product-3.png",
  },
  {
    id: "4",
    name: "알렌 에드먼드 캠브리지 쉘코도반 알든 ...",
    image: "/main/products/product-4.png",
  },
  {
    id: "5",
    name: "티파니앤코 채널 밴드링(백금, 스톤라운 ..",
    image: "/main/products/product-3.png",
  },
];

export const MAIN_FOOTER_LINKS = [
  { label: "회사소개", href: "#" },
  { label: "이용약관", href: "#" },
  { label: "고객지원", href: "#" },
  { label: "광고문의", href: "#" },
] as const;

export const HEADER_SEARCH_SUGGESTIONS = [
  "샤넬 클래식 플랩백",
  "에르메스 피코탄",
  "롤렉스 서브마리너",
  "루이비통 스피디",
  "디올 북 토트",
] as const;

export const MAIN_CATEGORY_PLACEHOLDER = "카테고리";

export const MAIN_SEARCH_PLACEHOLDER = "검색어를 입력하세요.";

export const MAIN_SLOGAN = "믿을 수 있는 거래의 시작";
