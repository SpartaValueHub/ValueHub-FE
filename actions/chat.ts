"use server";

/**
 * Chat Server Actions.
 * 클라이언트는 이 Action만 호출 — lib/api·services 직접 import 금지.
 */
import {
  ApiError,
  ApiTimeoutError,
  AuthSessionExpiredError,
} from "@/lib/api/client";
import { requireActionAuth } from "@/lib/session";
import { createChatRoomService } from "@/services/chat.service";

export type ChatActionResult<T> =
  { ok: true; data: T } | { ok: false; message: string };

function toErrorMessage(e: unknown, fallback: string) {
  if (e instanceof ApiTimeoutError) {
    return "서버 응답이 지연되고 있습니다. 잠시 후 다시 시도해 주세요.";
  }
  if (e instanceof ApiError) {
    if (e.code === "CANNOT_CHAT_WITH_SELF") {
      return "자신의 게시글과는 채팅할 수 없습니다.";
    }
    return e.message;
  }
  if (e instanceof Error) return e.message;
  return fallback;
}

export async function createChatRoomAction(input: {
  productPostUuid: string;
  sellerUuid: string;
  sellerNickname: string;
}): Promise<ChatActionResult<{ roomId: string; reused: boolean }>> {
  try {
    await requireActionAuth();
    const data = await createChatRoomService(input);
    return { ok: true, data };
  } catch (e) {
    if (e instanceof AuthSessionExpiredError) {
      return { ok: false, message: e.message };
    }
    return {
      ok: false,
      message: toErrorMessage(e, "채팅방을 만들지 못했습니다."),
    };
  }
}
