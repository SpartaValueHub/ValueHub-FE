import { z } from "zod";

export const CHAT_IMAGE_MAX_BYTES = 10 * 1024 * 1024;

export const CHAT_IMAGE_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const chatImagePresignedInputSchema = z.object({
  roomId: z.string().trim().min(1, "채팅방 정보가 올바르지 않습니다."),
  contentType: z.enum(CHAT_IMAGE_CONTENT_TYPES),
  fileSize: z
    .number()
    .int()
    .positive()
    .max(CHAT_IMAGE_MAX_BYTES, "이미지 용량이 너무 큽니다."),
});

export type ChatImagePresignedInput = z.infer<
  typeof chatImagePresignedInputSchema
>;
