import { connection } from "next/server";

import { ChatListTemplate } from "@/components/templates/ChatListTemplate";
import { logAuthSessionDetail, requireAuth } from "@/lib/session";
import { listChatRoomsService } from "@/services/chat.service";

/** 채팅방 목록 — 요청마다 최신 조회 (캐시 없음) */
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ChatPage() {
  await connection();
  const user = await requireAuth("/chat");
  await logAuthSessionDetail("chat-list");
  const rooms = await listChatRoomsService(user.accessToken);

  return (
    <ChatListTemplate rooms={rooms} accessToken={user.accessToken} />
  );
}
