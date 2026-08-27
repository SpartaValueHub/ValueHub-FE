/**
 * Reservations-Service API DTO (lib/api 전용).
 * docs/reservation-api.md 와 1:1. 문서에 없는 필드·상태를 넣지 않는다.
 */

export type ApiReservationStatus = "CONFIRMED" | "CANCELED";

export type ApiReservationListStatusQuery = ApiReservationStatus | "ALL";

export type ApiReservationErrorCode =
  | "RESERVATION_AUTH_MISSING"
  | "INVALID_REQUEST"
  | "CANNOT_RESERVE_WITH_SELF"
  | "RESERVATION_ACCESS_DENIED"
  | "RESERVATION_ALREADY_CONFIRMED"
  | "RESERVATION_NOT_FOUND"
  | "RESERVATION_NOT_CONFIRMED"
  | "RESERVATION_ALREADY_CANCELED";

/** 공통 상세 바디 — 등록·현재 예약·단건·수정·취소 */
export interface ApiReservationDetail {
  reservationId: string;
  chatRoomId: string;
  productPostUuid: string;
  buyerUuid: string;
  sellerUuid: string;
  scheduledAt: string;
  placeName: string;
  address: string | null;
  latitude: number;
  longitude: number;
  status: ApiReservationStatus;
  createdBy: string;
  canceledBy: string | null;
  canceledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiCreateReservationRequest {
  chatRoomId: string;
  productPostUuid: string;
  buyerUuid: string;
  sellerUuid: string;
  scheduledAt: string;
  placeName: string;
  address?: string | null;
  latitude: number;
  longitude: number;
}

export interface ApiUpdateReservationRequest {
  scheduledAt?: string;
  placeName?: string;
  address?: string | null;
  latitude?: number;
  longitude?: number;
}

export interface ApiReservationListItem {
  reservationId: string;
  chatRoomId: string;
  productPostUuid: string;
  scheduledAt: string;
  placeName: string;
  status: ApiReservationStatus;
}

export interface ApiReservationList {
  reservations: ApiReservationListItem[];
}
