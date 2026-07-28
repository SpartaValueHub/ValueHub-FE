import { mapChatMessage, normalizeChatMessages } from "@/lib/chat/map";
import { sortRoomsByLatest } from "@/lib/chat/rooms";
import {
  getChatRoom,
  getLatestChatMessages,
  listChatRooms,
  sendChatMessage,
} from "@/lib/api/chat";
import { ApiError } from "@/lib/api/client";
import type { ApiChatRoom } from "@/types/chat/api";
import type { UiChatMessage, UiChatRoom } from "@/types/chat/ui";

export { mapChatMessage };

function mapRoom(room: ApiChatRoom): UiChatRoom {
  return {
    chatRoomUuid: room.chatRoomUuid,
    title: room.roomName,
    lastMessage: room.lastMessage,
    lastMessageAt: room.lastMessageAt,
  };
}

/** 채팅방 목록 — GET /api/v1/chat/rooms (최신 메시지순) */
export async function listChatRoomsService(
  accessToken: string
): Promise<UiChatRoom[]> {
  const rooms = await listChatRooms(accessToken);
  return sortRoomsByLatest(rooms.map(mapRoom));
}

/** 채팅방 단건 — GET /api/v1/chat/rooms/{uuid} */
export async function getChatRoomService(
  chatRoomUuid: string,
  accessToken: string
): Promise<UiChatRoom | undefined> {
  try {
    const room = await getChatRoom(chatRoomUuid, accessToken);
    return mapRoom(room);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return undefined;
    }
    throw error;
  }
}

export async function listLatestChatMessagesService(
  chatRoomUuid: string,
  accessToken: string,
  currentUserUuid: string
): Promise<UiChatMessage[]> {
  const messages = normalizeChatMessages(
    await getLatestChatMessages(chatRoomUuid, accessToken)
  );
  return messages.map((message) => mapChatMessage(message, currentUserUuid));
}

export async function sendChatMessageService(input: {
  chatRoomUuid: string;
  message: string;
  messageType?: string;
  senderUuid: string;
  accessToken: string;
}): Promise<UiChatMessage> {
  const created = await sendChatMessage(
    {
      chatRoomUuid: input.chatRoomUuid,
      messageType: input.messageType ?? "TEXT",
      message: input.message,
      senderUuid: input.senderUuid,
    },
    input.accessToken
  );

  const [message] = normalizeChatMessages(created);
  if (!message) {
    throw new Error("메시지 전송 응답이 올바르지 않습니다.");
  }

  return mapChatMessage(message, input.senderUuid);
}
