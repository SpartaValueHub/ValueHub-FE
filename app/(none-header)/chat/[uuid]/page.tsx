import { notFound } from "next/navigation";

import { ChatRoomTemplate } from "@/components/templates/chat/ChatRoomTemplate";
import { requireAuth } from "@/lib/session";
import { listChatRoomWorkspaceService } from "@/services/chat.service";

interface ChatRoomPageProps {
  params: Promise<{ uuid: string }>;
}

export default async function ChatRoomPage({ params }: ChatRoomPageProps) {
  const { uuid } = await params;
  await requireAuth(`/chat/${uuid}`);

  const workspace = await listChatRoomWorkspaceService(uuid).catch(() => null);
  if (!workspace) {
    notFound();
  }

  return (
    <ChatRoomTemplate
      rooms={workspace.rooms}
      roomId={workspace.room.id}
      messages={workspace.messages}
    />
  );
}
