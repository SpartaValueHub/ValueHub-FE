import { getAuthUser } from "@/lib/session";
import { listChatRoomsService } from "@/services/chat.service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
};

/**
 * GET /api/chat/rooms
 * 로그인 사용자 전용 채팅방 리스트 BFF → Chat BE GET /api/v1/chat/rooms
 * 캐시 없이 매 요청 최신 조회
 */
export async function GET() {
  const user = await getAuthUser();
  if (!user) {
    return Response.json(
      { message: "로그인이 필요합니다." },
      { status: 401, headers: NO_STORE_HEADERS }
    );
  }

  try {
    const rooms = await listChatRoomsService(user.accessToken);
    return Response.json(rooms, { headers: NO_STORE_HEADERS });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "채팅방 목록을 불러오지 못했습니다.";
    return Response.json(
      { message },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}
