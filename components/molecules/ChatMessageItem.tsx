import { cn } from "@/lib/utils";
import type { UiChatMessage } from "@/types/chat/ui";

interface ChatMessageItemProps {
  message: UiChatMessage;
}

export function ChatMessageItem({ message }: ChatMessageItemProps) {
  return (
    <div
      className={cn(
        "flex w-full",
        message.isMine ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-xl px-3 py-2 text-sm",
          message.isMine
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground"
        )}
      >
        <p className="whitespace-pre-wrap break-words">{message.message}</p>
        <p
          className={cn(
            "mt-1 text-xs",
            message.isMine
              ? "text-primary-foreground/70"
              : "text-muted-foreground"
          )}
        >
          {message.createdAt}
        </p>
      </div>
    </div>
  );
}
