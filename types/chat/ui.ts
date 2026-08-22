export type UiChatRoom = {
  id: string;
  title: string;
  thumbnail: string;
  timeAgo: string;
  unreadCount: number;
  peerName: string;
  peerImageUrl?: string | null;
  price: number;
  location: string;
  lastMessage?: string;
  reserved?: boolean;
  productPostUuid?: string;
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
  createdAt?: string;
  dateKey?: string;
  reservationSummary?: {
    dateLine: string;
    timePlaceLine: string;
  };
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
