import { z } from "zod";

const iso8601Message = "시각 형식이 올바르지 않습니다.";
const uuidMessage = "식별자 형식이 올바르지 않습니다.";

const uuidSchema = z
  .string()
  .trim()
  .regex(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    uuidMessage
  );

const iso8601Schema = z
  .string()
  .trim()
  .min(1, iso8601Message)
  .refine((value) => !Number.isNaN(Date.parse(value)), iso8601Message);

const chatRoomIdSchema = z
  .string()
  .trim()
  .min(1, "채팅방 정보가 올바르지 않습니다.");

const placeNameSchema = z
  .string()
  .trim()
  .min(1, "장소명을 입력해 주세요.")
  .max(100, "장소명은 최대 100자까지 가능합니다.");

export const createReservationInputSchema = z.object({
  chatRoomId: chatRoomIdSchema,
  scheduledAt: iso8601Schema,
  placeName: placeNameSchema,
  address: z.string().max(255).nullable().optional(),
  latitude: z.number({ error: "좌표가 올바르지 않습니다." }).finite(),
  longitude: z.number({ error: "좌표가 올바르지 않습니다." }).finite(),
});

export type CreateReservationInput = z.infer<
  typeof createReservationInputSchema
>;

export const updateReservationInputSchema = z
  .object({
    reservationId: uuidSchema,
    scheduledAt: iso8601Schema.optional(),
    placeName: placeNameSchema.optional(),
    address: z.string().max(255).nullable().optional(),
    latitude: z
      .number({ error: "좌표가 올바르지 않습니다." })
      .finite()
      .optional(),
    longitude: z
      .number({ error: "좌표가 올바르지 않습니다." })
      .finite()
      .optional(),
  })
  .refine(
    (data) =>
      data.scheduledAt != null ||
      data.placeName != null ||
      data.address !== undefined ||
      data.latitude != null ||
      data.longitude != null,
    { message: "변경할 내용이 없습니다." }
  )
  .refine((data) => (data.latitude == null) === (data.longitude == null), {
    message: "위도와 경도를 함께 보내 주세요.",
  });

export type UpdateReservationInput = z.infer<
  typeof updateReservationInputSchema
>;

export const reservationIdInputSchema = z.object({
  reservationId: uuidSchema,
});

export const listMyReservationsInputSchema = z.object({
  status: z.enum(["CONFIRMED", "CANCELED", "ALL"]).optional(),
});

export type ListMyReservationsInput = z.infer<
  typeof listMyReservationsInputSchema
>;
