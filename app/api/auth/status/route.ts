import { getAuthUser } from "@/lib/session";

export async function GET() {
  try {
    const user = await getAuthUser();
    return Response.json({
      isAuthenticated: !!user,
      user: user
        ? {
            uuid: user.uuid,
            logInId: user.logInId,
            name: user.name,
          }
        : null,
    });
  } catch (error) {
    console.error("Auth status check failed:", error);
    return Response.json(
      { isAuthenticated: false, user: null },
      { status: 500 }
    );
  }
}
