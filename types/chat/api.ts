/**
 * Chat-Service API DTO (lib/api 전용).
 * Gateway 배포 OpenAPI: /chat-service/v3/api-docs
 */

export type ApiChatTradeStatus = "SELLING" | "RESERVED" | "SOLD_OUT";

export type ApiChatMessageType = "TEXT" | "IMAGE" | "LOCATION" | "RESERVATION";

export interface ApiCreateChatRoomRequest {
  productPostUuid: string;
  sellerUuid: string;
  productPostImageUrl: string;
  productPostName: string;
  price: number;
  tradeStatus: ApiChatTradeStatus;
  sellerNickname: string;
}

export interface ApiCreateChatRoomResponse {
  roomId: string;
  productPostUuid: string;
  buyerUuid: string;
  sellerUuid: string;
  reused: boolean;
}

export interface ApiChatProductPost {
  productPostUuid: string;
  productPostImageUrl: string;
  productPostName: string;
  price: number;
  tradeStatus: ApiChatTradeStatus;
}

export interface ApiChatSeller {
  memberUuid: string;
  nickname: string;
}

export interface ApiChatCounterpart {
  memberUuid: string;
}

/** GET /rooms/{id} — 말풍선·헤더용 상대 */
export interface ApiChatRoomDetailCounterpart {
  memberUuid: string;
  nickname: string;
  profileImageUrl?: string | null;
}

export interface ApiChatRoomDetail {
  roomId: string;
  productPost: ApiChatProductPost;
  seller: ApiChatSeller;
  counterpart: ApiChatRoomDetailCounterpart;
}

/** GET /api/v1/chat/rooms — 스냅샷이 없으면 productPost·필드는 null */
export interface ApiChatRoomListProduct {
  productPostUuid: string | null;
  productPostImageUrl: string | null;
  productPostName: string | null;
  price: number | null;
  tradeStatus: ApiChatTradeStatus | null;
}

export interface ApiChatRoomListLastMessage {
  content: string;
  createdAt: string;
}

export interface ApiChatRoomListItem {
  roomId: string;
  productPost: ApiChatRoomListProduct | null;
  counterpart: ApiChatCounterpart | null;
  lastMessage: ApiChatRoomListLastMessage | null;
  unreadCount: number;
  updatedAt: string;
}

export interface ApiChatRoomList {
  rooms: ApiChatRoomListItem[];
}

/** STOMP /user/queue/chat-list — 목록 한 줄 패치 */
export interface ApiChatListPatch {
  roomId: string;
  lastMessage?: ApiChatRoomListLastMessage | string | null;
  unreadCount?: number;
  updatedAt?: string;
  content?: string;
  createdAt?: string;
}

/** GET /api/v1/chat/unread-count */
export interface ApiChatUnreadCount {
  totalUnreadCount: number;
}

export interface ApiChatMessageMetadata {
  fileSize?: string;
  imageWidth?: number;
  imageHeight?: number;
  reservationId?: string;
  meetAt?: string;
  price?: number;
  placeName?: string;
  latitude?: number;
  longitude?: number;
}

export interface ApiChatMessage {
  messageId: string;
  senderUuid: string;
  messageType: ApiChatMessageType;
  content: string;
  metadata?: ApiChatMessageMetadata | null;
  createdAt: string;
}

export interface ApiChatMessageList {
  messages: ApiChatMessage[];
}
