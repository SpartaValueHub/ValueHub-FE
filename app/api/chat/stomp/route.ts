import { getChatApiUrl } from "@/lib/api/client";
import { httpToWsUrl } from "@/lib/chat/stomp";
import { logSafeError } from "@/lib/log/safe-log";
import { getAuthUser } from "@/lib/session";

export const dynamic = "force-dynamic";

/**
 * 브라우저 STOMP 접속 정보.
 * memberUuid는 채팅 소켓 CONNECT 전용 — SessionContext에는 넣지 않는다.
 */
export async function GET() {
  const user = await getAuthUser();
  if (!user) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    return Response.json({
      wsUrl: httpToWsUrl(getChatApiUrl()),
      memberUuid: user.memberUuid,
    });
  } catch (error) {
    logSafeError("Chat stomp config failed:", error);
    return Response.json({ error: "unavailable" }, { status: 502 });
  }
}
