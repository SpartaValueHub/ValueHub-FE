import type { ApiMediaPresignedResponse } from "@/types/media/api";
import type { UiMediaPresigned } from "@/types/media/ui";

export function mapMediaPresigned(
  api: ApiMediaPresignedResponse
): UiMediaPresigned {
  const uploadUrl = api.uploadUrl?.trim() ?? "";
  const publicUrl = api.publicUrl?.trim() ?? "";
  if (!uploadUrl || !publicUrl) {
    throw new Error("이미지 업로드 주소를 받지 못했습니다.");
  }
  return {
    uploadUrl,
    publicUrl,
    s3Key: api.s3Key?.trim() || null,
    expiresInSeconds: api.expiresInSeconds ?? null,
  };
}
