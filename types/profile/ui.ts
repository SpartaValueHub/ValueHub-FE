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
