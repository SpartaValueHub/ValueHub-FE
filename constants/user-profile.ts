import type { UiTradeReviewDetail, UiUserProfile } from "@/types/profile/ui";

/** 유저 프로필 모달 — BE 미연동, Figma 목업 */
export const USER_PROFILE_DEMO: UiUserProfile = {
  nickname: "초량동불주먹",
  joinedAtLabel: "20xx.xx.xx일 가입",
  avatarUrl: "/main/products/product-1.png",
  trustGrade: "bronze",
  city: "부산시",
  neighborhood: "초량동",
  neighborhoodVerified: true,
  rating: 3.8,
  products: [
    {
      id: "1",
      name: "버버리 레더 포켓 미니토트백",
      image: "/main/products/product-2.png",
      price: 1_500_000,
      priceKor: "백오십만",
      timeAgo: "30분 전",
    },
    {
      id: "2",
      name: "프라다 사피아노 두블레 버킷백 화이트",
      image: "/main/products/product-1.png",
      price: 1_500_000,
      priceKor: "백오십만",
      timeAgo: "30분 전",
    },
    {
      id: "3",
      name: "불가리 BB33 골드",
      image: "/main/products/product-3.png",
      price: 1_500_000,
      priceKor: "백오십만",
      timeAgo: "30분 전",
    },
    {
      id: "4",
      name: "샤넬 도빌백 라지 핑크",
      image: "/main/products/product-4.png",
      price: 1_500_000,
      priceKor: "백오십만",
      timeAgo: "30분 전",
    },
  ],
};

/** 거래 후기 상세 모달 — BE 미연동, Figma 목업 */
export const TRADE_REVIEW_DETAIL_DEMO: UiTradeReviewDetail = {
  rating: 3.8,
  totalCount: 100,
  distribution: [
    { score: 5, count: 10 },
    { score: 4, count: 10 },
    { score: 3, count: 10 },
    { score: 2, count: 10 },
    { score: 1, count: 10 },
  ],
  reviews: [
    {
      id: "1",
      nickname: "초량동불주먹",
      avatarUrl: "/main/products/product-1.png",
      roleLabel: "구매자",
      dateLabel: "2026.07.10일",
      content:
        "상품 컨디션이 기대 이상이었고, 거래 과정도 매우 만족스러웠습니다.",
    },
    {
      id: "2",
      nickname: "초량동불주먹",
      avatarUrl: "/main/products/product-2.png",
      roleLabel: "구매자",
      dateLabel: "2026.07.10일",
      content:
        "상품 컨디션이 기대 이상이었고, 거래 과정도 매우 만족스러웠습니다.",
    },
    {
      id: "3",
      nickname: "초량동불주먹",
      avatarUrl: "/main/products/product-3.png",
      roleLabel: "판매자",
      dateLabel: "2026.07.10일",
      content: "약속한 장소와 시간에 맞춰 방문해 주셔서 감사합니다.",
    },
    {
      id: "4",
      nickname: "초량동불주먹",
      avatarUrl: "/main/products/product-4.png",
      roleLabel: "판매자",
      dateLabel: "2026.07.10일",
      content: "약속 시간을 잘 지켜주셨고, 거래가 원활하게 진행되었습니다.",
    },
  ],
};
