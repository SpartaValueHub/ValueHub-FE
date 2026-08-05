import { getAuthUser } from "@/lib/session";
import { toClientSessionUser } from "@/types/auth/session";

export async function GET() {
  try {
    const user = await getAuthUser();
    return Response.json({
      isAuthenticated: !!user,
      user: user ? toClientSessionUser(user) : null,
    });
  } catch (error) {
    console.error("Auth status check failed:", error);
    return Response.json(
      { isAuthenticated: false, user: null },
      { status: 500 }
    );
  }
}
