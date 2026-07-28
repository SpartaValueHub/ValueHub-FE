import { cn } from "@/lib/utils";
import type { UiChatMessage } from "@/types/chat/ui";

interface ChatListItemProps {
  message: UiChatMessage;
}

function shortSender(senderUuid: string) {
  if (!senderUuid) return "상대";
  if (senderUuid.length <= 8) return senderUuid;
  return `${senderUuid.slice(0, 8)}…`;
}

/** 채팅 메시지 말풍선 — 내 메시지(오른쪽) / 상대 메시지(왼쪽) */
export function ChatListItem({ message }: ChatListItemProps) {
  const isMine = message.isMine;

  return (
    <article
      className={cn(
        "flex w-full",
        isMine ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "flex max-w-[80%] flex-col gap-1",
          isMine ? "items-end" : "items-start"
        )}
      >
        <div
          className={cn(
            "flex items-center gap-2 text-xs text-muted-foreground",
            isMine ? "flex-row-reverse" : "flex-row"
          )}
        >
          <span className="font-medium">
            {isMine ? "나" : "상대"}
          </span>
          {!isMine ? (
            <span className="truncate opacity-70">
              {shortSender(message.senderUuid)}
            </span>
          ) : null}
          {message.createdAt ? (
            <time dateTime={message.createdAt} className="shrink-0 opacity-70">
              {message.createdAt}
            </time>
          ) : null}
        </div>

        <div
          className={cn(
            "rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap break-words shadow-sm",
            isMine
              ? "rounded-br-md bg-primary text-primary-foreground"
              : "rounded-bl-md border bg-muted text-foreground"
          )}
        >
          {message.message}
        </div>
      </div>
    </article>
  );
}
