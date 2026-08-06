"use server";

import { mapActionError } from "@/lib/auth/map-action-error";
import { confirmIdentityVerificationService } from "@/services/identity-verification.service";
import type { ApiIdentityVerificationConfirmResponse } from "@/types/auth/api";

export type ConfirmIdentityVerificationActionResult =
  | { ok: true; data: ApiIdentityVerificationConfirmResponse }
  | { ok: false; message: string; code?: string };

/** PortOne SDK 완료 후 auth-service confirm — requestToken·prefill 반환 */
export async function confirmIdentityVerificationAction(
  identityVerificationId: string
): Promise<ConfirmIdentityVerificationActionResult> {
  const trimmed = identityVerificationId.trim();
  if (!trimmed) {
    return { ok: false, message: "본인인증 정보가 없습니다." };
  }

  try {
    const data = await confirmIdentityVerificationService({
      identityVerificationId: trimmed,
      purpose: "SIGN_UP",
    });
    return { ok: true, data };
  } catch (error) {
    return mapActionError(error, "본인인증 확인에 실패했습니다.");
  }
}
