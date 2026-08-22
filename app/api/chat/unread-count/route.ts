import { getChatUnreadCountService } from "@/services/chat.service";
import { getAuthUser } from "@/lib/session";
import { logSafeError } from "@/lib/log/safe-log";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getAuthUser();
  if (!user) {
    return Response.json({ totalUnreadCount: 0 }, { status: 401 });
  }

  try {
    const totalUnreadCount = await getChatUnreadCountService();
    return Response.json({ totalUnreadCount });
  } catch (error) {
    logSafeError("Chat unread-count failed:", error);
    return Response.json({ totalUnreadCount: 0 }, { status: 502 });
  }
}
