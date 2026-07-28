import { notFound } from "next/navigation";

import { ChatRoomTemplate } from "@/components/templates/ChatRoomTemplate";
import {
  getChatRoomService,
  listChatMessagesService,
} from "@/services/chat.service";
import type { UiChatMessage } from "@/types/chat/ui";

export default async function ChatRoomPage({
  params,
}: {
  params: Promise<{ chatRoomUuid: string }>;
}) {
  const { chatRoomUuid } = await params;
  const room = getChatRoomService(chatRoomUuid);

  if (!room) {
    notFound();
  }

  let messages: UiChatMessage[] = [];
  let errorMessage: string | undefined;

  try {
    messages = await listChatMessagesService(chatRoomUuid);
  } catch (e) {
    errorMessage =
      e instanceof Error ? e.message : "메시지를 불러오지 못했습니다.";
  }

  return (
    <ChatRoomTemplate
      room={room}
      messages={messages}
      errorMessage={errorMessage}
    />
  );
}
