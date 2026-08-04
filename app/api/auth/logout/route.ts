import { ApiError } from "@/lib/api/client";
import { getAuthUser } from "@/lib/session";
import { logoutService } from "@/services/auth.service";

/** auth-service logout — refresh 블랙리스트 등록 후 NextAuth signOut과 함께 호출 */
export async function POST() {
  const user = await getAuthUser();
  if (!user?.accessToken || !user.refreshToken) {
    return Response.json({ ok: true });
  }

  try {
    await logoutService(user.accessToken, user.refreshToken);
    return Response.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof ApiError
        ? error.message
        : error instanceof Error
          ? error.message
          : "로그아웃에 실패했습니다.";
    return Response.json({ ok: false, message }, { status: 502 });
  }
}
