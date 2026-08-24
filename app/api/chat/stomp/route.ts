import { CHAT_STOMP_PROXY_PATH } from "@/lib/chat/stomp";
import { logSafeError } from "@/lib/log/safe-log";
import { getAuthUser } from "@/lib/session";

export const dynamic = "force-dynamic";

/**
 * 방 상세 STOMP — 동일 출처 WS 프록시 경로 + 내 UUID.
 * 원격 Gateway WebSocket에는 HttpOnly 쿠키가 안 붙는다.
 * SessionContext에는 uuid를 넣지 않는다.
 */
export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return Response.json(
        { message: "로그인이 필요합니다." },
        { status: 401 }
      );
    }
    return Response.json({
      wsUrl: CHAT_STOMP_PROXY_PATH,
      memberUuid: user.memberUuid,
    });
  } catch (error) {
    logSafeError("Chat stomp config failed:", error);
    return Response.json(
      { message: "채팅 연결 정보를 불러오지 못했습니다." },
      { status: 502 }
    );
  }
}
