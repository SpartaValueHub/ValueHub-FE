"use server";

/**
 * Member Server Actions.
 * 클라이언트는 이 Action만 호출 — lib/api·services 직접 import 금지.
 */
import { z } from "zod";

import { ApiError, ApiTimeoutError } from "@/lib/api/client";
import { mapActionError } from "@/lib/auth/map-action-error";
import { requireActionAuth } from "@/lib/session";
import {
  createMemberMediaPresignedUrlService,
  updateMyMemberService,
} from "@/services/member.service";
import type { UiMemberProfile } from "@/types/member/ui";
import { mediaPresignedInputSchema } from "@/types/media/presign";
import type { UiMediaPresigned } from "@/types/media/ui";

export type MemberActionResult<T> =
  { ok: true; data: T } | { ok: false; message: string; code?: string };

function toErrorMessage(e: unknown, fallback: string) {
  if (e instanceof ApiTimeoutError) {
    return "서버 응답이 지연되고 있습니다. 잠시 후 다시 시도해 주세요.";
  }
  if (e instanceof ApiError) return e.message;
  if (e instanceof Error) return e.message;
  return fallback;
}

export async function createMemberMediaPresignedUrlAction(
  input: unknown
): Promise<MemberActionResult<UiMediaPresigned>> {
  const parsed = mediaPresignedInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message:
        parsed.error.issues[0]?.message ?? "이미지 정보가 올바르지 않습니다.",
    };
  }

  try {
    await requireActionAuth();
    const data = await createMemberMediaPresignedUrlService(parsed.data);
    return { ok: true, data };
  } catch (e) {
    return mapActionError(
      e,
      toErrorMessage(e, "이미지 업로드 주소를 받지 못했습니다.")
    );
  }
}

const updateProfileImageSchema = z.object({
  profileImageUrl: z
    .string()
    .trim()
    .url("프로필 이미지 주소가 올바르지 않습니다.")
    .max(500, "프로필 이미지 주소가 너무 깁니다."),
});

export async function updateMyProfileImageAction(
  input: unknown
): Promise<MemberActionResult<UiMemberProfile>> {
  const parsed = updateProfileImageSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message:
        parsed.error.issues[0]?.message ??
        "프로필 이미지 정보가 올바르지 않습니다.",
    };
  }

  try {
    await requireActionAuth();
    const data = await updateMyMemberService({
      profileImageUrl: parsed.data.profileImageUrl,
    });
    return { ok: true, data };
  } catch (e) {
    return mapActionError(
      e,
      toErrorMessage(e, "프로필 이미지를 저장하지 못했습니다.")
    );
  }
}
