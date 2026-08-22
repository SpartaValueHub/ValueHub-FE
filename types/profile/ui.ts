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
