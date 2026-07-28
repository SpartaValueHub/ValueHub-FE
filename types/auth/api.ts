/** API(백엔드) 요청/응답 DTO — lib/api 에서만 사용 */

export interface ApiSignupRequest {
  logInId: string;
  password: string;
  email: string;
  name: string;
  phone: string;
}

export interface ApiSignupResponse {
  email: string;
  logInId: string;
  name: string;
  userId: string;
}

export interface ApiSignInRequest {
  logInId: string;
  password: string;
}

/**
 * POST /api/v1/auth/sign-in 응답
 * 백엔드 필드명이 달라도 service에서 정규화합니다.
 */
export interface ApiSignInResponse {
  accessToken: string;
  refreshToken?: string;
  userId: string;
  logInId: string;
  name: string;
  email?: string;
}
