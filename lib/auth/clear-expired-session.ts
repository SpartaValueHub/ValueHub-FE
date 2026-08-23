import { clearAuthCookies } from "@/lib/auth/cookie-store";
import { clearNextAuthSession } from "@/lib/auth/nextauth-session";

/** Auth refresh 실패·만료 시 HttpOnly Auth 쿠키 + NextAuth 세션 쿠키 제거 */
export async function clearExpiredAuthSession() {
  await clearAuthCookies();
  await clearNextAuthSession();
}
