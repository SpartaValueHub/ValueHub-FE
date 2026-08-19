import { logSafeError } from "@/lib/log/safe-log";
import { getClientSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getClientSessionUser();
    return Response.json({
      isAuthenticated: !!user,
      user,
    });
  } catch (error) {
    logSafeError("Auth status check failed:", error);
    return Response.json(
      { isAuthenticated: false, user: null },
      { status: 500 }
    );
  }
}
