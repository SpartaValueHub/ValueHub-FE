"use server";

/**
 * Reservation Server Actions.
 * 클라이언트는 이 Action만 호출 — lib/api·services 직접 import 금지.
 * 성공 후 Chat 말풍선·상품 tradeStatus API는 치지 않는다.
 */
import { ApiError, ApiTimeoutError } from "@/lib/api/client";
import { mapActionError } from "@/lib/auth/map-action-error";
import { requireActionAuth } from "@/lib/session";
import {
  cancelReservationService,
  createReservationService,
  getCurrentReservationByChatRoomService,
  getReservationService,
  listMyReservationsService,
  updateReservationService,
} from "@/services/reservations.service";
import {
  createReservationInputSchema,
  listMyReservationsInputSchema,
  reservationIdInputSchema,
  updateReservationInputSchema,
} from "@/types/reservations/schema";
import type {
  UiReservation,
  UiReservationListItem,
} from "@/types/reservations/ui";

export type ReservationActionResult<T> =
  { ok: true; data: T } | { ok: false; message: string; code?: string };

function toErrorMessage(e: unknown, fallback: string) {
  if (e instanceof ApiTimeoutError) {
    return "서버 응답이 지연되고 있습니다. 잠시 후 다시 시도해 주세요.";
  }
  if (e instanceof ApiError) return e.message;
  if (e instanceof Error) return e.message;
  return fallback;
}

export async function createReservationAction(
  input: unknown
): Promise<ReservationActionResult<UiReservation>> {
  const parsed = createReservationInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message:
        parsed.error.issues[0]?.message ?? "예약 정보가 올바르지 않습니다.",
      code: "INVALID_REQUEST",
    };
  }

  try {
    const user = await requireActionAuth();
    const data = await createReservationService(user.memberUuid, parsed.data);
    return { ok: true, data };
  } catch (e) {
    return mapActionError(e, toErrorMessage(e, "예약을 등록하지 못했습니다."));
  }
}

export async function updateReservationAction(
  input: unknown
): Promise<ReservationActionResult<UiReservation>> {
  const parsed = updateReservationInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message:
        parsed.error.issues[0]?.message ?? "예약 정보가 올바르지 않습니다.",
      code: "INVALID_REQUEST",
    };
  }

  try {
    await requireActionAuth();
    const data = await updateReservationService(parsed.data);
    return { ok: true, data };
  } catch (e) {
    return mapActionError(e, toErrorMessage(e, "예약을 수정하지 못했습니다."));
  }
}

export async function cancelReservationAction(
  input: unknown
): Promise<ReservationActionResult<UiReservation>> {
  const parsed = reservationIdInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message:
        parsed.error.issues[0]?.message ?? "예약 정보가 올바르지 않습니다.",
      code: "INVALID_REQUEST",
    };
  }

  try {
    await requireActionAuth();
    const data = await cancelReservationService(parsed.data.reservationId);
    return { ok: true, data };
  } catch (e) {
    return mapActionError(e, toErrorMessage(e, "예약을 취소하지 못했습니다."));
  }
}

export async function getReservationByChatRoomAction(
  chatRoomId: string,
  productPostUuid?: string
): Promise<ReservationActionResult<UiReservation | null>> {
  const id = chatRoomId.trim();
  if (!id) {
    return {
      ok: false,
      message: "채팅방 정보가 올바르지 않습니다.",
      code: "INVALID_REQUEST",
    };
  }

  try {
    await requireActionAuth();
    const data = await getCurrentReservationByChatRoomService(
      id,
      productPostUuid?.trim() || undefined
    );
    return { ok: true, data };
  } catch (e) {
    return mapActionError(
      e,
      toErrorMessage(e, "현재 예약을 불러오지 못했습니다.")
    );
  }
}

export async function getReservationAction(
  reservationId: string
): Promise<ReservationActionResult<UiReservation>> {
  const parsed = reservationIdInputSchema.safeParse({ reservationId });
  if (!parsed.success) {
    return {
      ok: false,
      message:
        parsed.error.issues[0]?.message ?? "예약 정보가 올바르지 않습니다.",
      code: "INVALID_REQUEST",
    };
  }

  try {
    await requireActionAuth();
    const data = await getReservationService(parsed.data.reservationId);
    return { ok: true, data };
  } catch (e) {
    return mapActionError(e, toErrorMessage(e, "예약을 불러오지 못했습니다."));
  }
}

export async function listMyReservationsAction(
  input?: unknown
): Promise<ReservationActionResult<UiReservationListItem[]>> {
  const parsed = listMyReservationsInputSchema.safeParse(input ?? {});
  if (!parsed.success) {
    return {
      ok: false,
      message:
        parsed.error.issues[0]?.message ??
        "예약 목록 조건이 올바르지 않습니다.",
      code: "INVALID_REQUEST",
    };
  }

  try {
    await requireActionAuth();
    const data = await listMyReservationsService(parsed.data.status);
    return { ok: true, data };
  } catch (e) {
    return mapActionError(
      e,
      toErrorMessage(e, "예약 목록을 불러오지 못했습니다.")
    );
  }
}
