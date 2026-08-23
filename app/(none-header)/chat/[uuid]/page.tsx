import { notFound } from "next/navigation";

import { ChatRoomTemplate } from "@/components/templates/chat/ChatRoomTemplate";
import { CHAT_MESSAGES, CHAT_ROOMS } from "@/constants/chat-page";
import { getAuthUser } from "@/lib/session";
import {
  getChatRoomService,
  listChatMessagesService,
} from "@/services/chat.service";
import type { UiChatMessage } from "@/types/chat/ui";

interface ChatRoomPageProps {
  params: Promise<{ uuid: string }>;
}

export default async function ChatRoomPage({ params }: ChatRoomPageProps) {
  const { uuid } = await params;
  const mock = CHAT_ROOMS.find((item) => item.id === uuid);
  if (mock) {
    return (
      <ChatRoomTemplate
        rooms={CHAT_ROOMS}
        roomId={mock.id}
        messages={CHAT_MESSAGES}
      />
    );
  }

  const authUser = await getAuthUser();
  let room;
  try {
    room = await getChatRoomService(uuid);
  } catch {
    notFound();
  }

  let messages: UiChatMessage[] = [];
  if (authUser) {
    try {
      messages = await listChatMessagesService(uuid, authUser.memberUuid);
    } catch {
      messages = [];
    }
  }

  return (
    <ChatRoomTemplate
      rooms={[room, ...CHAT_ROOMS]}
      roomId={room.id}
      messages={messages}
    />
  );
}
