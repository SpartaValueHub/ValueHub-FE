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

export interface ApiChatRoomDetail {
  roomId: string;
  productPost: ApiChatProductPost;
  seller: ApiChatSeller;
  counterpart: ApiChatCounterpart;
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
