import { z } from "zod";

export const createChatRoomInputSchema = z.object({
  productPostUuid: z.string().trim().min(1, "상품 정보가 올바르지 않습니다."),
  sellerUuid: z.string().trim().min(1, "판매자 정보가 올바르지 않습니다."),
  sellerNickname: z.string().trim().optional(),
});

export type CreateChatRoomInput = z.infer<typeof createChatRoomInputSchema>;
