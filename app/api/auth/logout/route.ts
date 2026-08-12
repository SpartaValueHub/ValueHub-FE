import { clearAuthCookies } from "@/lib/auth/cookie-store";
import { logSafeError } from "@/lib/log/safe-log";
import { isIgnorableLogoutFailure } from "@/lib/auth/logout-errors";
import { clearNextAuthSession } from "@/lib/auth/nextauth-session";
import { getAuthUser } from "@/lib/session";
import { logoutService } from "@/services/auth.service";

/** auth-service logout — Redis·blacklist 처리 후 Auth.js·HttpOnly Cookie 정리 */
export async function POST() {
  const user = await getAuthUser();

  try {
    if (user) {
      await logoutService();
    }
  } catch (error) {
    if (!isIgnorableLogoutFailure(error)) {
      logSafeError("Backend logout failed:", error);
    }
  }

  await clearAuthCookies();
  await clearNextAuthSession();
  return Response.json({ ok: true });
}
