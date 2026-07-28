import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import type { UiChatRoom } from "@/types/chat/ui";

interface ChatRoomItemProps {
  room: UiChatRoom;
}

export function ChatRoomItem({ room }: ChatRoomItemProps) {
  return (
    <Link href={`/chat/${room.chatRoomUuid}`} className="block">
      <Card className="transition-colors hover:bg-muted/40">
        <CardHeader>
          <CardTitle>{room.title}</CardTitle>
          <CardDescription className="truncate">
            {room.chatRoomUuid}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="truncate text-sm text-muted-foreground">
            {room.lastMessage ?? "아직 메시지가 없습니다."}
          </p>
          {room.lastMessageAt ? (
            <p className="mt-1 text-xs text-muted-foreground">
              {room.lastMessageAt}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </Link>
  );
}
