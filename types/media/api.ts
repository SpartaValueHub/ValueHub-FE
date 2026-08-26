/** Member / Product-Post media Presign 공통 응답 형태 */

export interface ApiMediaPresignedRequest {
  contentType: string;
  contentLength: number;
}

export interface ApiMediaPresignedResponse {
  uploadUrl: string;
  s3Key?: string;
  publicUrl: string;
  expiresInSeconds?: number;
}
