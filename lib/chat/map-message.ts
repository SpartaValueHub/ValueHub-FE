import type { ApiChatMessage } from "@/types/chat/api";
import type { UiChatMessage } from "@/types/chat/ui";

export function formatChatTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("ko-KR", {
    hour: "numeric",
    minute: "2-digit",
  });
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
      imageSrc: api.content,
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
