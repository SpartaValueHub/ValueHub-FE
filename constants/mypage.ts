import type { UiMyPage, UiMyPageTradeItem } from "@/types/mypage/ui";

const TRADE_TITLE = "발렌티노 카프스킨 스터드 사인 로퍼 블랙";

const BASE_TRADE = {
  title: TRADE_TITLE,
  date: "2026.07.07",
  location: "초량동",
  price: 10_000_000,
} as const;

const MOCK_SELL_ITEMS: UiMyPageTradeItem[] = [
  {
    id: "sell-1",
    status: "selling",
    action: "boost",
    review: { kind: "locked" },
    ...BASE_TRADE,
  },
  {
    id: "sell-2",
    status: "reserved",
    action: "complete",
    review: { kind: "locked" },
    ...BASE_TRADE,
  },
  {
    id: "sell-3",
    status: "completed",
    review: { kind: "rated", score: 5 },
    ...BASE_TRADE,
  },
  {
    id: "sell-4",
    status: "completed",
    review: { kind: "waitingPeer" },
    ...BASE_TRADE,
  },
];

export const MOCK_MYPAGE: UiMyPage = {
  account: {
    nickname: "초량동불주먹",
    joinedAt: "20xx.xx.xx일 가입",
    loginId: "qwer1234",
    phone: "010-1234-5678",
    email: "valuehub@gmail.com",
    marketingEmail: false,
    marketingSms: false,
  },
  trade: {
    trustGrade: "bronze",
    completedCount: 16,
    writtenReviewCount: 16,
    receivedReviewCount: 16,
    regionCity: "부산시",
    regionDong: "초량동",
    nextGradeHint:
      "다음 거래안심등급은 Silver 입니다. 성실한 거래 활동과 긍정적인 거래 이력을 쌓으면 다음 등급으로 승급할 수 있습니다.",
  },
  sellItems: MOCK_SELL_ITEMS,
  buyItems: [
    {
      id: "buy-1",
      status: "reserved",
      action: "complete",
      review: { kind: "locked" },
      ...BASE_TRADE,
    },
    {
      id: "buy-2",
      status: "completed",
      review: { kind: "rated", score: 5 },
      ...BASE_TRADE,
    },
    {
      id: "buy-3",
      status: "completed",
      review: { kind: "waitingPeer" },
      ...BASE_TRADE,
    },
  ],
  benefit: {
    title: "프리미엄(3개월) 결제중",
    expiresAt: "2026.10.09",
    description: "판매글을 1시간마다 1회씩, 1일 총 24회 끌어올릴 수 있습니다.",
  },
};

export function formatMyPagePrice(price: number) {
  return price.toLocaleString("ko-KR");
}
