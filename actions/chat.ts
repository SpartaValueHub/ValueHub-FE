"use server";

/**
 * Chat Server Actions.
 * 클라이언트는 이 Action만 호출 — lib/api·services 직접 import 금지.
 */
import { ApiError, ApiTimeoutError } from "@/lib/api/client";
import { mapActionError } from "@/lib/auth/map-action-error";
import { requireActionAuth } from "@/lib/session";
import { createChatRoomService } from "@/services/chat.service";
import { createChatRoomInputSchema } from "@/types/chat/create";
import type { UiCreatedChatRoom } from "@/types/chat/ui";

export type ChatActionResult<T> =
  { ok: true; data: T } | { ok: false; message: string; code?: string };

function toErrorMessage(e: unknown, fallback: string) {
  if (e instanceof ApiTimeoutError) {
    return "서버 응답이 지연되고 있습니다. 잠시 후 다시 시도해 주세요.";
  }
  if (e instanceof ApiError) return e.message;
  if (e instanceof Error) return e.message;
  return fallback;
}

export async function createChatRoomAction(
  input: unknown
): Promise<ChatActionResult<UiCreatedChatRoom>> {
  const parsed = createChatRoomInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message:
        parsed.error.issues[0]?.message ?? "채팅방 정보가 올바르지 않습니다.",
    };
  }

  try {
    await requireActionAuth();
    const data = await createChatRoomService(parsed.data);
    return { ok: true, data };
  } catch (e) {
    return mapActionError(e, toErrorMessage(e, "채팅방을 만들지 못했습니다."));
  }
}
