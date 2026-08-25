import { notFound } from "next/navigation";

import { ChatRoomTemplate } from "@/components/templates/chat/ChatRoomTemplate";
import { requireAuth } from "@/lib/session";
import {
  getChatRoomService,
  listChatMessagesService,
  listChatRoomsService,
} from "@/services/chat.service";
import type { UiChatMessagePage, UiChatRoom } from "@/types/chat/ui";

interface ChatRoomPageProps {
  params: Promise<{ uuid: string }>;
}

/**
 * `/chat/[uuid]` — 상세 GET + 왼쪽 목록은 `/chat`과 같은 GET /rooms
 */
export default async function ChatRoomPage({ params }: ChatRoomPageProps) {
  const { uuid } = await params;
  const user = await requireAuth(`/chat/${uuid}`);

  let room: UiChatRoom;
  try {
    room = await getChatRoomService(uuid);
  } catch {
    notFound();
  }

  const [rooms, messagePage] = await Promise.all([
    listChatRoomsService().catch((): UiChatRoom[] => []),
    listChatMessagesService(uuid, user.memberUuid).catch(
      (): UiChatMessagePage => ({ messages: [], hasMore: false })
    ),
  ]);

  const list = rooms.map((item) =>
    item.id === room.id
      ? {
          ...item,
          peerName: room.peerName,
          peerImageUrl: room.peerImageUrl,
          peerMemberUuid: room.peerMemberUuid ?? item.peerMemberUuid,
          productPostUuid: room.productPostUuid ?? item.productPostUuid,
        }
      : item
  );
  const roomsForUi = list.some((item) => item.id === room.id)
    ? list
    : [room, ...list];

  return (
    <ChatRoomTemplate
      rooms={roomsForUi}
      roomId={room.id}
      messages={messagePage.messages}
      hasMoreMessages={messagePage.hasMore}
    />
  );
}
