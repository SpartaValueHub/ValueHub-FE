import { getAuthUser } from "@/lib/session";

export async function GET() {
  try {
    const user = await getAuthUser();
    return Response.json({
      isAuthenticated: !!user,
      // 클라이언트에는 표시용 이름만 노출 (uuid / logInId 제외)
      user: user ? { name: user.name } : null,
    });
  } catch (error) {
    console.error("Auth status check failed:", error);
    return Response.json(
      { isAuthenticated: false, user: null },
      { status: 500 }
    );
  }
}
