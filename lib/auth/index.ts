export { authOptions } from "@/lib/auth/options";
export { AUTH_COOKIE_ACCESS, AUTH_COOKIE_REFRESH } from "@/lib/auth/cookies";
export {
  applyResponseCookies,
  buildAuthCookieHeader,
  clearAuthCookies,
  clearDuplicateLoginFlag,
  getRefreshTokenValue,
  hasDuplicateLoginFlag,
  hasSessionMaterial,
  markDuplicateLoginDetected,
} from "@/lib/auth/cookie-store";
export {
  AUTH_SESSION_TERMINATED,
  DuplicateLoginError,
  isDuplicateLoginRefreshFailure,
} from "@/lib/auth/duplicate-login";
export { isIgnorableLogoutFailure } from "@/lib/auth/logout-errors";
export { clearNextAuthSession } from "@/lib/auth/nextauth-session";
export { probeDuplicateLoginSession } from "@/lib/auth/session-probe";
