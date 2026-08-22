export type UiChatRoom = {
  id: string;
  title: string;
  thumbnail: string;
  timeAgo: string;
  unreadCount: number;
  peerName: string;
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
 * URL에는 uuid만 두고, 닉네임·이미지는 Member 공개 프로필로 resolve.
 * Chat 방 생성 API 연동 시 이 타입을 입력으로 쓰면 됨.
 */
export type UiProductChatEntry = {
  productPostUuid: string;
  sellerMemberUuid: string;
  sellerNickname: string | null;
  sellerProfileImageUrl: string | null;
};
