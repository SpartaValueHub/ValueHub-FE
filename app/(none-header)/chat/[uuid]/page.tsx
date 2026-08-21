import { notFound } from "next/navigation";

import { ChatRoomTemplate } from "@/components/templates/chat/ChatRoomTemplate";
import { CHAT_MESSAGES, CHAT_ROOMS } from "@/constants/chat-page";

interface ChatRoomPageProps {
  params: Promise<{ uuid: string }>;
}

export default async function ChatRoomPage({ params }: ChatRoomPageProps) {
  const { uuid } = await params;
  const room = CHAT_ROOMS.find((item) => item.id === uuid);
  if (!room) notFound();

  return (
    <ChatRoomTemplate
      rooms={CHAT_ROOMS}
      roomId={room.id}
      messages={CHAT_MESSAGES}
    />
  );
}
