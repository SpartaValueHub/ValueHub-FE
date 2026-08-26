/** 요구사항: 5MB · jpg/jpeg/png/webp (gif 제외) */
export const MEDIA_IMAGE_MAX_BYTES = 5 * 1024 * 1024;

export const MEDIA_IMAGE_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type MediaImageContentType = (typeof MEDIA_IMAGE_CONTENT_TYPES)[number];

export const MEDIA_IMAGE_ACCEPT = "image/jpeg,image/jpg,image/png,image/webp";

/** 브라우저 `image/jpg` 등을 BE 허용 contentType으로 정규화 */
export function normalizeMediaImageContentType(
  fileType: string
): MediaImageContentType | null {
  const t = fileType.trim().toLowerCase();
  if (t === "image/jpeg" || t === "image/jpg") return "image/jpeg";
  if (t === "image/png") return "image/png";
  if (t === "image/webp") return "image/webp";
  return null;
}

export function isAllowedMediaImageFile(file: File): boolean {
  return (
    normalizeMediaImageContentType(file.type) != null &&
    file.size > 0 &&
    file.size <= MEDIA_IMAGE_MAX_BYTES
  );
}

export const MEDIA_IMAGE_REJECT_MESSAGE =
  "이미지는 jpg/jpeg/png/webp, 장당 5MB 이하만 가능합니다.";
