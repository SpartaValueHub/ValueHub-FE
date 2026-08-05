import { clearAuthCookies } from "@/lib/auth/cookie-store";
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
    console.error("Backend logout failed:", error);
  }

  await clearAuthCookies();
  return Response.json({ ok: true });
}
