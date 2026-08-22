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
  placeName: string;
  mapImage: string;
};

export type UiTradeTimeValue = {
  period: "am" | "pm";
  hour: number;
  minute: number;
};
