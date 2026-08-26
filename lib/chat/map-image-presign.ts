import type { ApiChatImagePresignedResponse } from "@/types/chat/api";
import type { UiChatImagePresigned } from "@/types/chat/ui";

export function mapChatImagePresigned(
  api: ApiChatImagePresignedResponse
): UiChatImagePresigned {
  const uploadUrl = api.uploadUrl?.trim() ?? "";
  const s3Key =
    api.s3Key?.trim() || api.key?.trim() || api.objectKey?.trim() || "";
  if (!uploadUrl || !s3Key) {
    throw new Error("이미지 업로드 주소를 받지 못했습니다.");
  }
  return { uploadUrl, s3Key };
}
