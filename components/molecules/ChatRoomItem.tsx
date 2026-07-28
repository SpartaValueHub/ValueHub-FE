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
        {room.lastMessage ? (
          <CardContent>
            <p className="truncate text-sm text-muted-foreground">
              {room.lastMessage}
            </p>
          </CardContent>
        ) : null}
      </Card>
    </Link>
  );
}
