export type UiChatRoom = {
  id: string;
  title: string;
  thumbnail: string;
  timeAgo: string;
  unreadCount: number;
  peerName: string;
  peerImageUrl?: string | null;
  productPostUuid?: string;
  price: number;
  location: string;
  lastMessage?: string;
  reserved?: boolean;
};

export type UiChatReservationCard = {
  id: string;
  roomId: string;
  title: string;
  dateLabel: string;
  weekdayLabel: string;
  timeLabel: string;
  placeName: string;
};

export type UiChatMessage = {
  id: string;
  kind: "text" | "image" | "location" | "system-reservation" | "typing";
  from: "peer" | "me";
  text?: string;
  imageSrc?: string;
  placeName?: string;
  mapImage?: string;
  time?: string;
  /** API createdAt — 상대 박스 1분 묶음용 */
  createdAt?: string;
  reservationSummary?: {
    dateLine: string;
    timePlaceLine: string;
  };
};

/** GET /rooms/{id}/messages — 기본·최대는 문서 limit */
export const CHAT_MESSAGE_PAGE_SIZE = 50;

export type UiChatMessagePage = {
  messages: UiChatMessage[];
  hasMore: boolean;
};

export type UiTradeReservation = {
  date: Date;
  dateLabel: string;
  timeLabel: string;
  time: UiTradeTimeValue;
  placeName: string;
  mapImage: string;
};

export type UiTradeTimeValue = {
  period: "am" | "pm";
  hour: number;
  minute: number;
};

/**
 * 상품 상세 → 채팅 핸드오프.
 * uuid + (상세에서 조회한) sellerNickname → POST /rooms 입력.
 * 닉이 비면 `/chat`에서 Member profile로 한 번 더 보완.
 */
export type UiProductChatEntry = {
  productPostUuid: string;
  sellerMemberUuid: string;
  sellerNickname: string | null;
  sellerProfileImageUrl: string | null;
};

/** POST /rooms 성공 — 상세 `/chat/[roomId]` 이동용 */
export type UiCreatedChatRoom = {
  roomId: string;
  productPostUuid: string;
  buyerUuid: string;
  sellerUuid: string;
  reused: boolean;
};
