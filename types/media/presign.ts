import { z } from "zod";

import {
  MEDIA_IMAGE_CONTENT_TYPES,
  MEDIA_IMAGE_MAX_BYTES,
} from "@/lib/media/image-file";

export const mediaPresignedInputSchema = z.object({
  contentType: z.enum(MEDIA_IMAGE_CONTENT_TYPES),
  contentLength: z
    .number()
    .int()
    .positive()
    .max(MEDIA_IMAGE_MAX_BYTES, "이미지 용량이 너무 큽니다."),
});

export type MediaPresignedInput = z.infer<typeof mediaPresignedInputSchema>;
