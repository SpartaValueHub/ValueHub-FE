"use server";

import { requireActionAuth } from "@/lib/session";
import { sendChatMessageService } from "@/services/chat.service";
import {
  sendChatMessageSchema,
  type SendChatMessageFieldErrors,
} from "@/types/chat/message";

export type SendChatMessageActionState = {
  ok: boolean;
  message?: string;
  fieldErrors?: SendChatMessageFieldErrors;
};

export async function sendChatMessageAction(
  _prevState: SendChatMessageActionState,
  formData: FormData
): Promise<SendChatMessageActionState> {
  let auth;
  try {
    auth = await requireActionAuth();
  } catch {
    return {
      ok: false,
      message: "로그인이 필요합니다.",
    };
  }

  const values = {
    chatRoomUuid: String(formData.get("chatRoomUuid") ?? ""),
    message: String(formData.get("message") ?? ""),
    messageType: String(formData.get("messageType") ?? "TEXT"),
  };

  const parsed = sendChatMessageSchema.safeParse(values);

  if (!parsed.success) {
    return {
      ok: false,
      message: "입력값을 확인해 주세요.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await sendChatMessageService({
      chatRoomUuid: parsed.data.chatRoomUuid,
      message: parsed.data.message,
      messageType: parsed.data.messageType,
      senderUuid: auth.uuid,
      accessToken: auth.accessToken,
    });
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "메시지 전송에 실패했습니다.",
    };
  }

  return { ok: true };
}
