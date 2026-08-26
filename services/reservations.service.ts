/**
 * reservations-service 오케스트레이션.
 * 약속 원본은 Reservations. Chat 방 상세는 등록 시 seller/buyer/상품 UUID만 가져온다.
 */
import { getChatRoom } from "@/lib/api/chat";
import { ApiError } from "@/lib/api/client";
import {
  cancelReservation,
  createReservation,
  getReservation,
  getReservationByChatRoom,
  listMyReservations,
  updateReservation,
} from "@/lib/api/reservations";
import type {
  ApiReservationDetail,
  ApiReservationListItem,
} from "@/types/reservations/api";
import type {
  CreateReservationInput,
  UpdateReservationInput,
} from "@/types/reservations/schema";
import type {
  UiReservation,
  UiReservationListItem,
  UiReservationListStatusQuery,
} from "@/types/reservations/ui";

export function mapReservation(api: ApiReservationDetail): UiReservation {
  return {
    reservationId: api.reservationId,
    chatRoomId: api.chatRoomId,
    productPostUuid: api.productPostUuid,
    buyerUuid: api.buyerUuid,
    sellerUuid: api.sellerUuid,
    scheduledAt: api.scheduledAt,
    placeName: api.placeName,
    address: api.address,
    latitude: api.latitude,
    longitude: api.longitude,
    status: api.status === "CANCELED" ? "CANCELED" : "CONFIRMED",
    createdBy: api.createdBy,
    canceledBy: api.canceledBy,
    canceledAt: api.canceledAt,
    createdAt: api.createdAt,
    updatedAt: api.updatedAt,
  };
}

export function mapReservationListItem(
  api: ApiReservationListItem
): UiReservationListItem {
  return {
    reservationId: api.reservationId,
    chatRoomId: api.chatRoomId,
    productPostUuid: api.productPostUuid,
    scheduledAt: api.scheduledAt,
    placeName: api.placeName,
    status: api.status === "CANCELED" ? "CANCELED" : "CONFIRMED",
  };
}

/**
 * 채팅 입장 시 오른쪽 패널.
 * 204 → null (빈 패널). 이 방 CONFIRMED의 비당사자 403은 그대로 throw.
 * 404는 이 API가 쓰지 않는다. 빈 예약과 리소스 없음을 섞지 않는다.
 */
export async function getCurrentReservationByChatRoomService(
  chatRoomId: string,
  productPostUuid?: string
): Promise<UiReservation | null> {
  const api = await getReservationByChatRoom(chatRoomId, productPostUuid);
  if (!api) return null;
  return mapReservation(api);
}

export async function listMyReservationsService(
  status?: UiReservationListStatusQuery
): Promise<UiReservationListItem[]> {
  const api = await listMyReservations(status);
  return (api.reservations ?? []).map(mapReservationListItem);
}

export async function getReservationService(
  reservationId: string
): Promise<UiReservation> {
  const api = await getReservation(reservationId);
  return mapReservation(api);
}

export async function createReservationService(
  actorMemberUuid: string,
  input: CreateReservationInput
): Promise<UiReservation> {
  const room = await getChatRoom(input.chatRoomId);
  const productPostUuid = room.productPost?.productPostUuid?.trim() ?? "";
  const sellerUuid = room.seller?.memberUuid?.trim() ?? "";
  const buyerUuid = room.counterpart?.memberUuid?.trim() ?? "";

  if (!productPostUuid || !sellerUuid || !buyerUuid) {
    throw new ApiError(
      400,
      "채팅방 정보가 올바르지 않습니다.",
      "INVALID_REQUEST"
    );
  }

  if (actorMemberUuid !== sellerUuid) {
    throw new ApiError(
      403,
      "판매자만 예약을 등록할 수 있습니다.",
      "RESERVATION_ACCESS_DENIED"
    );
  }

  const api = await createReservation({
    chatRoomId: room.roomId,
    productPostUuid,
    buyerUuid,
    sellerUuid,
    scheduledAt: input.scheduledAt,
    placeName: input.placeName,
    address: input.address ?? null,
    latitude: input.latitude,
    longitude: input.longitude,
  });
  return mapReservation(api);
}

export async function updateReservationService(
  input: UpdateReservationInput
): Promise<UiReservation> {
  const body = {
    ...(input.scheduledAt != null ? { scheduledAt: input.scheduledAt } : {}),
    ...(input.placeName != null ? { placeName: input.placeName } : {}),
    ...(input.address !== undefined ? { address: input.address } : {}),
    ...(input.latitude != null ? { latitude: input.latitude } : {}),
    ...(input.longitude != null ? { longitude: input.longitude } : {}),
  };
  const api = await updateReservation(input.reservationId, body);
  return mapReservation(api);
}

export async function cancelReservationService(
  reservationId: string
): Promise<UiReservation> {
  const api = await cancelReservation(reservationId);
  return mapReservation(api);
}
