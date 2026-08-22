/**
 * Chat-Service API DTO (lib/api 전용).
 * docs: Chat-Service/docs/chat-api.md
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

export interface ApiChatRoomListProduct {
  productPostUuid: string | null;
  productPostImageUrl: string | null;
  productPostName: string | null;
  price: number | null;
  tradeStatus: ApiChatTradeStatus | null;
}

export interface ApiChatRoomListItem {
  roomId: string;
  productPost: ApiChatRoomListProduct | null;
  counterpart: { memberUuid: string } | null;
  lastMessage: { content: string; createdAt: string } | null;
  unreadCount: number;
  updatedAt: string;
}

export interface ApiChatRoomListResponse {
  rooms: ApiChatRoomListItem[];
}

export interface ApiChatUnreadCountResponse {
  totalUnreadCount: number;
}

export interface ApiChatRoomDetailProduct {
  productPostUuid: string;
  productPostImageUrl: string | null;
  productPostName: string | null;
  price: number | null;
  tradeStatus: ApiChatTradeStatus | null;
}

export interface ApiChatRoomDetailResponse {
  roomId: string;
  productPost: ApiChatRoomDetailProduct | null;
  seller: { memberUuid: string; nickname: string } | null;
  counterpart: {
    memberUuid: string;
    nickname: string;
    profileImageUrl: string | null;
  } | null;
}

export interface ApiChatMessageMetadata {
  fileSize?: string | null;
  imageWidth?: number | null;
  imageHeight?: number | null;
  reservationId?: string | null;
  meetAt?: string | null;
  price?: number | null;
  placeName?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface ApiChatMessage {
  messageId: string;
  roomId?: string;
  senderUuid: string;
  messageType: ApiChatMessageType;
  content: string | null;
  metadata: ApiChatMessageMetadata | null;
  createdAt: string;
}

export interface ApiChatMessageListResponse {
  messages: ApiChatMessage[];
}

export interface ApiChatListPreview {
  roomId: string;
  lastMessage: { content: string; createdAt: string } | null;
  unreadCount: number;
  updatedAt: string;
}
