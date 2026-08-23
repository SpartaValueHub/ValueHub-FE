export type UiTrustGrade =
  "bronze" | "silver" | "gold" | "platinum" | "diamond";

export type UiUserProfileProduct = {
  id: string;
  name: string;
  image: string;
  price: number;
  priceKor: string;
  timeAgo: string;
};

export type UiUserProfile = {
  nickname: string;
  joinedAtLabel: string;
  avatarUrl?: string;
  trustGrade: UiTrustGrade;
  city: string;
  neighborhood: string;
  neighborhoodVerified: boolean;
  rating: number;
  products: UiUserProfileProduct[];
};

/** 프로필 모달 필드별 데이터 출처 — 데모 확인용 */
export type UiProfileFieldSource = "api" | "mock";

export type UiUserProfileFieldSources = {
  nickname: UiProfileFieldSource;
  avatar: UiProfileFieldSource;
  joinedAt: UiProfileFieldSource;
  trustGrade: UiProfileFieldSource;
  region: UiProfileFieldSource;
  rating: UiProfileFieldSource;
  products: UiProfileFieldSource;
};

/** 프로필 모달 판매글 페이지 (더보기 append용) */
export type UiUserProfileProductsPage = {
  products: UiUserProfileProduct[];
  page: number;
  totalPages: number;
  hasMore: boolean;
};

export type UiUserProfileLoadStatus = "ok" | "unavailable" | "error";

export type UiUserProfileLoadResult =
  | {
      status: "ok";
      profile: UiUserProfile;
      sources: UiUserProfileFieldSources;
      /** 판매목록 API 성공 시 페이징 메타 */
      productsMeta?: Pick<
        UiUserProfileProductsPage,
        "page" | "totalPages" | "hasMore"
      >;
    }
  | {
      status: "unavailable";
    }
  | {
      status: "error";
    };

export type UiTradeReview = {
  id: string;
  nickname: string;
  avatarUrl?: string;
  roleLabel: string;
  dateLabel: string;
  content: string;
};

export type UiRatingDistribution = {
  score: 1 | 2 | 3 | 4 | 5;
  count: number;
};

export type UiTradeReviewDetail = {
  rating: number;
  ratingMax?: number;
  totalCount: number;
  distribution: UiRatingDistribution[];
  reviews: UiTradeReview[];
};
