import { z } from "zod";

import { CHAT_MESSAGE_PAGE_SIZE } from "@/types/chat/ui";

export const listOlderChatMessagesInputSchema = z.object({
  roomId: z.string().trim().min(1, "채팅방 정보가 올바르지 않습니다."),
  before: z.string().trim().min(1, "메시지 정보가 올바르지 않습니다."),
  limit: z
    .number()
    .int()
    .min(1)
    .max(100)
    .optional()
    .default(CHAT_MESSAGE_PAGE_SIZE),
});

export type ListOlderChatMessagesInput = z.infer<
  typeof listOlderChatMessagesInputSchema
>;
