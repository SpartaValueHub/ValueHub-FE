import type {
  UiChatMessage,
  UiChatReservationCard,
  UiChatRoom,
  UiTradeReservation,
  UiTradeTimeValue,
} from "@/types/chat/ui";

const WEEKDAYS = [
  "일요일",
  "월요일",
  "화요일",
  "수요일",
  "목요일",
  "금요일",
  "토요일",
] as const;

export const CHAT_MAP_PREVIEW = "/chat/map-preview.png";
export const CHAT_MAP_PICKER = "/chat/map-picker.png";
export const CHAT_LOCATION_PIN = "/chat/location-pin.svg";

export const CHAT_ROOMS: UiChatRoom[] = [
  {
    id: "room-1",
    title: "볼워치 엔지니어3 마블라이트 36mm 핑크 오토매틱",
    thumbnail: "/main/products/product-1.png",
    timeAgo: "30분 전",
    unreadCount: 99,
    lastMessage: "우리집에 왜 왔니 왜 왔니 왜 왔니",
    reserved: true,
    peerName: "해운대김철수",
    price: 2_450_000,
    location: "우동김철수",
  },
  {
    id: "room-2",
    title: "루이비통 에삐 쁘띠삭플라 블랙",
    thumbnail: "/main/products/product-3.png",
    timeAgo: "06월 06일",
    unreadCount: 10,
    lastMessage: "꽃찾으러 왔단다 왔단다 왔단다",
    reserved: true,
    peerName: "서면이영희",
    price: 1_280_000,
    location: "부전동이영희",
  },
  {
    id: "room-3",
    title: "디타 린스트럼2 26년 08월 구매",
    thumbnail: "/main/products/product-4.png",
    timeAgo: "30분 전",
    unreadCount: 1,
    lastMessage: "무궁화 꽃이 피었습니다.",
    peerName: "남포박민수",
    price: 890_000,
    location: "남포동박민수",
  },
  {
    id: "room-4",
    title: "발렌티노 카프스킨 스터드 사인 로퍼 블랙",
    thumbnail: "/main/products/product-2.png",
    timeAgo: "30분 전",
    unreadCount: 0,
    lastMessage: "무궁화 꽃이 피었습니다.",
    peerName: "중앙동홍길동",
    price: 1_500_000,
    location: "중앙동홍길동",
  },
  {
    id: "room-5",
    title: "샤넬 도빌백 라지 핑크",
    thumbnail: "/main/products/product-3.png",
    timeAgo: "30분 전",
    unreadCount: 0,
    lastMessage: "무궁화 꽃이 피었습니다.",
    peerName: "센텀최지우",
    price: 3_200_000,
    location: "재송동최지우",
  },
  {
    id: "room-6",
    title: "루이비통 모노그램 니트 반팔티",
    thumbnail: "/main/products/product-4.png",
    timeAgo: "30분 전",
    unreadCount: 0,
    lastMessage: "무궁화 꽃이 피었습니다.",
    peerName: "광안정하나",
    price: 620_000,
    location: "광안동정하나",
  },
  {
    id: "room-7",
    title: "에르메스 벌킨 25 골드 토고",
    thumbnail: "/main/products/product-1.png",
    timeAgo: "어제",
    unreadCount: 3,
    peerName: "해운대박서준",
    price: 8_900_000,
    location: "우동박서준",
  },
  {
    id: "room-8",
    title: "구찌 홀스빗 1955 숄더백",
    thumbnail: "/main/products/product-2.png",
    timeAgo: "어제",
    unreadCount: 0,
    peerName: "서면서민정",
    price: 1_150_000,
    location: "부전동서민정",
  },
  {
    id: "room-9",
    title: "까르띠에 탱크 머스트 스몰",
    thumbnail: "/main/products/product-3.png",
    timeAgo: "2일 전",
    unreadCount: 0,
    peerName: "남포이준호",
    price: 4_200_000,
    location: "남포동이준호",
  },
  {
    id: "room-10",
    title: "프라다 나일론 버킷백 블랙",
    thumbnail: "/main/products/product-4.png",
    timeAgo: "2일 전",
    unreadCount: 7,
    peerName: "센텀김하늘",
    price: 980_000,
    location: "재송동김하늘",
  },
  {
    id: "room-11",
    title: "셀린느 트리오페 미디엄",
    thumbnail: "/main/products/product-1.png",
    timeAgo: "3일 전",
    unreadCount: 0,
    peerName: "광안윤서아",
    price: 2_780_000,
    location: "광안동윤서아",
  },
  {
    id: "room-12",
    title: "디올 새들백 미니 블랙",
    thumbnail: "/main/products/product-2.png",
    timeAgo: "3일 전",
    unreadCount: 0,
    peerName: "중앙동한지민",
    price: 3_450_000,
    location: "중앙동한지민",
  },
  {
    id: "room-13",
    title: "오메가 스피드마스터 문워치",
    thumbnail: "/main/products/product-3.png",
    timeAgo: "2026.08.12",
    unreadCount: 0,
    peerName: "해운대조은별",
    price: 7_100_000,
    location: "우동조은별",
  },
  {
    id: "room-14",
    title: "루이비통 네버풀 MM 모노그램",
    thumbnail: "/main/products/product-4.png",
    timeAgo: "2026.08.10",
    unreadCount: 2,
    peerName: "서면강다은",
    price: 2_050_000,
    location: "부전동강다은",
  },
  {
    id: "room-15",
    title: "샤넬 클래식 플랩백 캐비어",
    thumbnail: "/main/products/product-1.png",
    timeAgo: "2026.08.08",
    unreadCount: 0,
    peerName: "남포최유리",
    price: 9_800_000,
    location: "남포동최유리",
  },
];

export const CHAT_RESERVATIONS: UiChatReservationCard[] = [
  {
    id: "reservation-1",
    roomId: "room-2",
    title: "루이비통 에삐 쁘띠...",
    dateLabel: "2026.08.26",
    weekdayLabel: "수요일",
    timeLabel: "오후 6시 30분",
    placeName: "부산역 1번출구 앞",
  },
  {
    id: "reservation-2",
    roomId: "room-1",
    title: "볼워치 엔지니어3 ...",
    dateLabel: "2026.08.31",
    weekdayLabel: "월요일",
    timeLabel: "오후 6시 30분",
    placeName: "부산역 1번출구 앞",
  },
  {
    id: "reservation-3",
    roomId: "room-4",
    title: "발렌티노 카프스킨 스...",
    dateLabel: "2026.08.26",
    weekdayLabel: "수요일",
    timeLabel: "오후 6시 30분",
    placeName: "초량동",
  },
];

export const CHAT_MESSAGES: UiChatMessage[] = [
  {
    id: "m1",
    kind: "text",
    from: "peer",
    text: "거래 어쩌고저쩌고 이러쿵저러쿵",
  },
  {
    id: "m2",
    kind: "text",
    from: "peer",
    text: "거래 어쩌고저쩌고 이러쿵저러쿵\n이렇게저렇게 일해라절해라한이럄넒;ㅅ홈;ㅏ허",
  },
  {
    id: "m3",
    kind: "text",
    from: "peer",
    text: "거래 어쩌고저쩌고 이러쿵저러쿵",
    time: "오후 12:30",
  },
  {
    id: "m4",
    kind: "text",
    from: "me",
    text: "거래 어쩌고저쩌고 이러쿵저러쿵\n이렇게저렇게 일해라절해라한이럄넒;ㅅ홈;ㅏ허",
  },
  {
    id: "m5",
    kind: "text",
    from: "me",
    text: "거래 어쩌고저쩌고 이러쿵저러쿵",
    time: "오후 12:32",
  },
  {
    id: "m6",
    kind: "text",
    from: "peer",
    text: "거래 어쩌고저쩌고 이러쿵저러쿵\n이렇게저렇게 일해라절해라한이럄넒;ㅅ홈;ㅏ허",
    time: "오후 12:35",
  },
  { id: "m7", kind: "typing", from: "peer" },
];

export const CHAT_DATE_DIVIDER = "07월 31일 금요일";

const WEEKDAY_SHORT = ["일", "월", "화", "수", "목", "금", "토"] as const;

export function formatReservationDate(date: Date): string {
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 ${WEEKDAYS[date.getDay()]}`;
}

export function formatReservationChipDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}.${month}.${day}`;
}

export function formatReservationChipSubline(
  date: Date,
  time: UiTradeTimeValue
): string {
  const periodLabel = time.period === "am" ? "오전" : "오후";
  const minute = String(time.minute).padStart(2, "0");
  return `(${WEEKDAY_SHORT[date.getDay()]}) ${periodLabel} ${time.hour}:${minute}`;
}

export function parseReservationTimeLabel(label: string): UiTradeTimeValue {
  const period = label.includes("오전") ? "am" : "pm";
  const hour = Number(label.match(/(\d+)\s*시/)?.[1] ?? 6);
  const minute = Number(label.match(/(\d+)\s*분/)?.[1] ?? 0);
  return { period, hour, minute };
}

export function dateAndTimeFromScheduledAt(iso: string): {
  date: Date;
  time: UiTradeTimeValue;
} {
  const date = new Date(iso);
  const hours = date.getHours();
  const period: "am" | "pm" = hours < 12 ? "am" : "pm";
  let hour = hours % 12;
  if (hour === 0) hour = 12;
  return {
    date,
    time: { period, hour, minute: date.getMinutes() },
  };
}

export function scheduledAtFromDateAndTime(
  date: Date,
  time: UiTradeTimeValue
): string {
  const hours24 =
    time.period === "am"
      ? time.hour === 12
        ? 0
        : time.hour
      : time.hour === 12
        ? 12
        : time.hour + 12;
  const next = new Date(date);
  next.setHours(hours24, time.minute, 0, 0);
  return next.toISOString();
}

export function reservationCardFromListItem(
  item: {
    reservationId: string;
    chatRoomId: string;
    scheduledAt: string;
    placeName: string;
  },
  title: string
): UiChatReservationCard {
  const { date, time } = dateAndTimeFromScheduledAt(item.scheduledAt);
  return {
    id: item.reservationId,
    roomId: item.chatRoomId,
    title,
    dateLabel: formatReservationChipDate(date),
    weekdayLabel: WEEKDAYS[date.getDay()],
    timeLabel: formatReservationTime(time.period, time.hour, time.minute),
    placeName: item.placeName,
  };
}

export function reservationFromCard(
  card: UiChatReservationCard
): UiTradeReservation {
  const [year, month, day] = card.dateLabel.split(".").map(Number);
  const date = new Date(year, month - 1, day);
  const time = parseReservationTimeLabel(card.timeLabel);
  return {
    date,
    dateLabel: formatReservationDate(date),
    timeLabel: formatReservationTime(time.period, time.hour, time.minute),
    time,
    placeName: card.placeName,
    mapImage: CHAT_MAP_PREVIEW,
  };
}

export function formatReservationDateLine(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}.${month}.${day} ${WEEKDAYS[date.getDay()]}`;
}

export function formatReservationTime(
  period: "am" | "pm",
  hour: number,
  minute: number
): string {
  const periodLabel = period === "am" ? "오전" : "오후";
  if (minute === 0) return `${periodLabel} ${hour}시`;
  return `${periodLabel} ${hour}시 ${minute}분`;
}

export const TIME_PERIOD_OPTIONS = [
  { id: "am", title: "오전" },
  { id: "pm", title: "오후" },
];

export const TIME_HOUR_OPTIONS = Array.from({ length: 12 }, (_, index) => {
  const hour = index + 1;
  return { id: String(hour), title: String(hour).padStart(2, "0") };
});

export const TIME_MINUTE_OPTIONS = Array.from({ length: 12 }, (_, index) => {
  const minute = index * 5;
  return { id: String(minute), title: String(minute).padStart(2, "0") };
});
