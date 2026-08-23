import type { UiUserProfile } from "@/types/profile/ui";

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
