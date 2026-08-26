import { apiFetch, getReservationsApiUrl } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type {
  ApiCreateReservationRequest,
  ApiReservationDetail,
  ApiReservationList,
  ApiReservationListStatusQuery,
  ApiUpdateReservationRequest,
} from "@/types/reservations/api";

/** reservations-service HTTP — lib/api/* 전용. UI·actions에서 import 금지. */

function reservationsFetch<T>(
  path: string,
  options: { method?: string; body?: unknown } = {}
) {
  return apiFetch<T>(path, {
    method: options.method ?? "GET",
    body: options.body,
    baseUrl: getReservationsApiUrl(),
    cache: { noStore: true },
    timeoutMillis: 12_000,
  });
}

export function createReservation(body: ApiCreateReservationRequest) {
  return reservationsFetch<ApiReservationDetail>(
    API_ENDPOINTS.reservations.create,
    { method: "POST", body }
  );
}

/** 204 바디 없음 → null. 빈 패널이며 404가 아니다. */
export async function getReservationByChatRoom(
  chatRoomId: string,
  productPostUuid?: string
): Promise<ApiReservationDetail | null> {
  const data = await reservationsFetch<ApiReservationDetail | null>(
    API_ENDPOINTS.reservations.byChatRoom(chatRoomId, productPostUuid)
  );
  return data ?? null;
}

export function listMyReservations(status?: ApiReservationListStatusQuery) {
  return reservationsFetch<ApiReservationList>(
    API_ENDPOINTS.reservations.me(status)
  );
}

export function getReservation(reservationId: string) {
  return reservationsFetch<ApiReservationDetail>(
    API_ENDPOINTS.reservations.detail(reservationId)
  );
}

export function updateReservation(
  reservationId: string,
  body: ApiUpdateReservationRequest
) {
  return reservationsFetch<ApiReservationDetail>(
    API_ENDPOINTS.reservations.detail(reservationId),
    { method: "PATCH", body }
  );
}

export function cancelReservation(reservationId: string) {
  return reservationsFetch<ApiReservationDetail>(
    API_ENDPOINTS.reservations.detail(reservationId),
    { method: "DELETE" }
  );
}
