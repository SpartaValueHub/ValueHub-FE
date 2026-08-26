import { putFileToS3 } from "@/lib/media/put-to-s3";

/** @deprecated putFileToS3 사용 — 채팅 호환용 래퍼 */
export async function putChatImageToS3(
  uploadUrl: string,
  file: Blob,
  contentType: string
) {
  return putFileToS3(uploadUrl, file, contentType);
}
