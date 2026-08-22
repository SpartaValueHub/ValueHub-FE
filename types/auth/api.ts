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
  signupCompletionToken: string;
  authUuid: string;
  logInId: string;
  email: string;
  memberName: string;
  birthdayDate: string;
}

export interface ApiSignupResumeRequest {
  logInId: string;
  password: string;
  captchaToken?: string;
}

export interface ApiSignupResumeResponse {
  authUuid: string;
  signupCompletionToken: string;
}

export interface ApiSignInResponse {
  memberUuid: string;
  nickname: string;
  role: string;
}

export interface ApiAvailabilityResponse {
  available: boolean;
}

/** GET /api/v1/auth/me */
export interface ApiAuthAccountResponse {
  logInId: string;
  email: string;
  phoneNumber: string;
  /** ISO-8601 Instant — auth.created_at */
  joinedAt: string;
}

export type VerificationPurpose =
  | "SIGN_UP"
  | "SOCIAL_LINK"
  | "FIND_ID"
  | "RESET_PASSWORD"
  | "WITHDRAWAL";

export interface ApiIdentityVerificationConfirmRequest {
  identityVerificationId: string;
  purpose: VerificationPurpose;
}

export type ApiGender = "MALE" | "FEMALE" | "OTHER";

export interface ApiIdentityVerificationConfirmResponse {
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
  retryAfterSeconds?: number;
}
