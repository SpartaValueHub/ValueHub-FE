import {
  DUMMY_CHAT_ROOMS,
  DUMMY_SENDER_UUID,
} from "@/lib/chat/dummy";
import { listChatMessages, sendChatMessage } from "@/lib/api/chat";
import type { ApiChatMessage } from "@/types/chat/api";
import type { UiChatMessage, UiChatRoom } from "@/types/chat/ui";

export function mapChatMessage(message: ApiChatMessage): UiChatMessage {
  return {
    chatMessageUuid: message.chatMessageUuid,
    chatRoomUuid: message.chatRoomUuid,
    messageType: message.messageType,
    message: message.message,
    senderUuid: message.senderUuid,
    createdAt: message.createdAt,
    updatedAt: message.updatedAt,
    isMine: message.senderUuid === DUMMY_SENDER_UUID,
  };
}

export function listChatRoomsService(): UiChatRoom[] {
  return DUMMY_CHAT_ROOMS.map((room) => ({
    chatRoomUuid: room.chatRoomUuid,
    title: room.title,
    lastMessage: room.lastMessage,
  }));
}

export function getChatRoomService(
  chatRoomUuid: string
): UiChatRoom | undefined {
  return listChatRoomsService().find(
    (room) => room.chatRoomUuid === chatRoomUuid
  );
}

export async function listChatMessagesService(
  chatRoomUuid: string
): Promise<UiChatMessage[]> {
  const messages = await listChatMessages(chatRoomUuid);
  return messages.map(mapChatMessage);
}

export async function sendChatMessageService(input: {
  chatRoomUuid: string;
  message: string;
  messageType?: string;
}): Promise<UiChatMessage> {
  const created = await sendChatMessage({
    chatRoomUuid: input.chatRoomUuid,
    messageType: input.messageType ?? "TEXT",
    message: input.message,
    senderUuid: DUMMY_SENDER_UUID,
  });
  return mapChatMessage(created);
}
