import { redirect } from "next/navigation";

import { CHAT_INITIAL_ROOM_ID } from "@/constants/chat-page";

/** `/chat`은 목록 진입점 — 실제 화면은 채팅방 ID를 붙인다. */
export default function ChatIndexPage() {
  redirect(`/chat/${CHAT_INITIAL_ROOM_ID}`);
}
