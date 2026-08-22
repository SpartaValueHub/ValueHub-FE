export type UiMyPageSectionId = "account" | "trade" | "payment";

export type UiTrustGradeLevel =
  "bronze" | "silver" | "gold" | "platinum" | "diamond";

export type UiTradeListKind = "sell" | "buy";

export type UiTradeStatus = "selling" | "reserved" | "completed";

export type UiTradeReview =
  | { kind: "locked" }
  | { kind: "rated"; score: number }
  | { kind: "waitingPeer" };

export type UiMyPageTradeItem = {
  id: string;
  status: UiTradeStatus;
  title: string;
  date: string;
  location: string;
  price: number;
  action?: "boost" | "complete";
  review: UiTradeReview;
};

export type UiMyPageAccount = {
  nickname: string;
  /** Member `profileImageUrl` — 없으면 UI 기본 아바타 */
  profileImageUrl?: string | null;
  joinedAt: string;
  loginId: string;
  phone: string;
  email: string;
  marketingEmail: boolean;
  marketingSms: boolean;
};

export type UiMyPageTradeSummary = {
  trustGrade: UiTrustGradeLevel;
  completedCount: number;
  writtenReviewCount: number;
  receivedReviewCount: number;
  regionCity: string;
  regionDong: string;
  nextGradeHint: string;
};

export type UiMyPageBenefit = {
  title: string;
  expiresAt: string;
  description: string;
};

export type UiMyPage = {
  account: UiMyPageAccount;
  trade: UiMyPageTradeSummary;
  sellItems: UiMyPageTradeItem[];
  buyItems: UiMyPageTradeItem[];
  benefit: UiMyPageBenefit;
};
