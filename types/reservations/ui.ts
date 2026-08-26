/**
 * Reservations UI 모델 — 공통 상세·목록 카드.
 */

export type UiReservationStatus = "CONFIRMED" | "CANCELED";

export type UiReservationListStatusQuery = UiReservationStatus | "ALL";

export type UiReservation = {
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
  status: UiReservationStatus;
  createdBy: string;
  canceledBy: string | null;
  canceledAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UiReservationListItem = {
  reservationId: string;
  chatRoomId: string;
  productPostUuid: string;
  scheduledAt: string;
  placeName: string;
  status: UiReservationStatus;
};
