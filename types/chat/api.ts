/** API(백엔드/BFF) 요청/응답 DTO — lib/api 에서만 사용 */

export interface ApiChatMessage {
  chatMessageUuid: string;
  chatRoomUuid: string;
  messageType: string;
  message: string;
  senderUuid: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiChatMessageRequest {
  chatRoomUuid: string;
  messageType: string;
  message: string;
  senderUuid: string;
}

/** GET /api/v1/chat/rooms — Chat BE */
export interface ApiChatRoom {
  chatRoomUuid: string;
  roomName: string;
  lastMessage?: string;
  lastMessageAt?: string;
  createdAt?: string;
  updatedAt?: string;
}
