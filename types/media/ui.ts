export type UiMediaPresigned = {
  uploadUrl: string;
  publicUrl: string;
  s3Key: string | null;
  expiresInSeconds: number | null;
};
