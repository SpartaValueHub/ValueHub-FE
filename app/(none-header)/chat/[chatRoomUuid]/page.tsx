import { notFound } from "next/navigation";

import { ChatRoomTemplate } from "@/components/templates/ChatRoomTemplate";
import { logAuthSessionDetail, requireAuth } from "@/lib/session";
import {
  getChatRoomService,
  listLatestChatMessagesService,
} from "@/services/chat.service";
import type { UiChatMessage } from "@/types/chat/ui";

export default async function ChatRoomPage({
  params,
}: {
  params: Promise<{ chatRoomUuid: string }>;
}) {
  const { chatRoomUuid } = await params;
  const user = await requireAuth(`/chat/${chatRoomUuid}`);
  await logAuthSessionDetail(`chat-room:${chatRoomUuid}`);
  const room = await getChatRoomService(chatRoomUuid, user.accessToken);

  if (!room) {
    notFound();
  }

  let initialMessages: UiChatMessage[] = [];

  try {
    initialMessages = await listLatestChatMessagesService(
      chatRoomUuid,
      user.accessToken,
      user.uuid
    );
  } catch {
    initialMessages = [];
  }

  return (
    <ChatRoomTemplate
      room={room}
      initialMessages={initialMessages}
      currentUserUuid={user.uuid}
      accessToken={user.accessToken}
    />
  );
}
