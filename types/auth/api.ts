/**
 * auth-service API DTO (lib/api 전용).
 * UI 모델(Ui*)·zod는 types/auth/signup.ts 등 별도 — BE 필드와 1:1 유지.
 */

export interface ApiSignupRequest {
  requestToken: string;
  logInId: string;
  password: string;
  email: string;
}

export interface ApiSignupResponse {
  authUuid: string;
  logInId: string;
  email: string;
  memberName: string;
  birthdayDate: string;
}

export interface ApiSignInRequest {
  logInId: string;
  password: string;
}

export interface ApiSignInResponse {
  accessToken: string;
  refreshToken: string;
  authUuid: string;
  logInId: string;
  memberName: string;
  email: string;
}

export interface ApiRefreshRequest {
  refreshToken: string;
}

export interface ApiLogoutRequest {
  accessToken: string;
  refreshToken: string;
}

export interface ApiAvailabilityResponse {
  available: boolean;
}

export type VerificationPurpose =
  "SIGN_UP" | "SOCIAL_LINK" | "FIND_ID" | "RESET_PASSWORD";

export interface ApiIdentityVerificationConfirmRequest {
  identityVerificationId: string;
  purpose: VerificationPurpose;
}

export type ApiGender = "MALE" | "FEMALE" | "OTHER";

export interface ApiIdentityVerificationResponse {
  requestToken: string;
  purpose: VerificationPurpose;
  status: string;
  memberName?: string;
  phoneNumber?: string;
  birthdayDate?: string;
  gender?: ApiGender;
}

export interface ApiErrorResponse {
  timestamp: string;
  status: number;
  code: string;
  message: string;
  path: string;
}
