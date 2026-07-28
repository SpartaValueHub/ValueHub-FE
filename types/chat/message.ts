import { z } from "zod";

export const sendChatMessageSchema = z.object({
  chatRoomUuid: z.string().min(1, "채팅방 정보가 없습니다."),
  message: z
    .string()
    .trim()
    .min(1, "메시지를 입력해 주세요.")
    .max(1000, "메시지는 1000자 이하여야 합니다."),
  messageType: z.string().default("TEXT"),
});

export type SendChatMessageInput = z.infer<typeof sendChatMessageSchema>;

export type SendChatMessageFieldErrors = Partial<
  Record<keyof SendChatMessageInput, string[] | undefined>
>;
