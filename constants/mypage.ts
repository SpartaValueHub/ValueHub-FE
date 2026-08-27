import type { UiMyPage, UiMyPageTradeItem } from "@/types/mypage/ui";

const TRADE_TITLE = "발렌티노 카프스킨 스터드 사인 로퍼 블랙";

/** 마이페이지 판매 목록 페이지 크기 (BE size) */
export const MYPAGE_SELL_PAGE_SIZE = 10;

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
  memberRegions: [],
  sellItems: MOCK_SELL_ITEMS,
  sellList: {
    items: MOCK_SELL_ITEMS,
    page: 1,
    totalPages: 1,
    totalElements: MOCK_SELL_ITEMS.length,
    hasMore: false,
  },
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
};

export function formatMyPagePrice(price: number) {
  return price.toLocaleString("ko-KR");
}
