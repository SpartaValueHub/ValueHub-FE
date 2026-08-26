/** Presigned URL로 S3에 직접 PUT (Gateway 경유 아님) */
export async function putFileToS3(
  uploadUrl: string,
  file: Blob,
  contentType: string
) {
  const res = await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": contentType },
  });
  if (!res.ok) {
    throw new Error("이미지를 올리지 못했습니다.");
  }
}
