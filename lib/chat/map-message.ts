import type { ApiChatMessage } from "@/types/chat/api";
import type { UiChatMessage } from "@/types/chat/ui";

const WEEKDAYS_KO = [
  "일요일",
  "월요일",
  "화요일",
  "수요일",
  "목요일",
  "금요일",
  "토요일",
] as const;

export function formatChatTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("ko-KR", {
    hour: "numeric",
    minute: "2-digit",
  });
}

/** 대화 날짜 구분선 — `08월 27일 목요일` */
export function formatChatDateLabel(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${month}월 ${day}일 ${WEEKDAYS_KO[date.getDay()]}`;
}

export function isSameChatDay(a?: string, b?: string) {
  if (!a || !b) return false;
  const left = new Date(a);
  const right = new Date(b);
  if (Number.isNaN(left.getTime()) || Number.isNaN(right.getTime())) {
    return false;
  }
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

/** 예약 시스템 메시지는 판매자 발신으로 본다 */
export function alignReservationMessage(
  message: UiChatMessage,
  viewerIsSeller: boolean
): UiChatMessage {
  if (message.kind !== "system-reservation") return message;
  return { ...message, from: viewerIsSeller ? "me" : "peer" };
}

export function mapChatMessage(
  api: ApiChatMessage,
  viewerMemberUuid: string
): UiChatMessage {
  const from = api.senderUuid === viewerMemberUuid ? "me" : "peer";
  const time = formatChatTime(api.createdAt);
  const createdAt = api.createdAt;

  if (api.messageType === "IMAGE") {
    return {
      id: api.messageId,
      kind: "image",
      from,
      imageSrc: api.content.trim(),
      time,
      createdAt,
    };
  }
  if (api.messageType === "LOCATION") {
    return {
      id: api.messageId,
      kind: "location",
      from,
      placeName: api.metadata?.placeName || api.content,
      latitude: api.metadata?.latitude,
      longitude: api.metadata?.longitude,
      time,
      createdAt,
    };
  }
  if (api.messageType === "RESERVATION") {
    const meetAt = api.metadata?.meetAt
      ? formatChatTime(api.metadata.meetAt)
      : "";
    return {
      id: api.messageId,
      kind: "system-reservation",
      from,
      time,
      createdAt,
      reservationSummary: {
        dateLine: api.content,
        timePlaceLine: [meetAt, api.metadata?.placeName]
          .filter(Boolean)
          .join(" "),
      },
    };
  }

  return {
    id: api.messageId,
    kind: "text",
    from,
    text: api.content,
    time,
    createdAt,
  };
}
