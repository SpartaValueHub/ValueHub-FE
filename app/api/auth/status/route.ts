import { clearExpiredAuthSession } from "@/lib/auth/clear-expired-session";
import { logSafeError } from "@/lib/log/safe-log";
import { getClientSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";

/**
 * 헤더 SessionContext용.
 * 만료·쿠키 없음이면 Route Handler에서 Auth·NextAuth 쿠키를 정리한다 (RSC에서는 delete 불가).
 */
export async function GET() {
  try {
    const user = await getClientSessionUser();
    if (!user) {
      try {
        await clearExpiredAuthSession();
      } catch (error) {
        logSafeError("Auth status cookie clear failed:", error);
      }
    }
    return Response.json({
      isAuthenticated: !!user,
      user,
    });
  } catch (error) {
    logSafeError("Auth status check failed:", error);
    try {
      await clearExpiredAuthSession();
    } catch (clearError) {
      logSafeError("Auth status cookie clear failed:", clearError);
    }
    return Response.json(
      { isAuthenticated: false, user: null },
      { status: 500 }
    );
  }
}
