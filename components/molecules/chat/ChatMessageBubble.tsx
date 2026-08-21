import { cn } from "@/lib/utils";

interface ChatMessageBubbleProps {
  from: "peer" | "me";
  children: React.ReactNode;
  time?: string;
  className?: string;
}

/** 채팅 말풍선 — 수신 흰 보더 / 발신 크림 */
export function ChatMessageBubble({
  from,
  children,
  time,
  className,
}: ChatMessageBubbleProps) {
  const mine = from === "me";

  return (
    <div
      className={cn(
        "flex items-end gap-[11px]",
        mine ? "justify-end" : "justify-start"
      )}
    >
      {mine && time ? (
        <span className="shrink-0 font-sans text-xs text-[#606060]">
          {time}
        </span>
      ) : null}
      <div
        className={cn(
          "max-w-[440px] rounded-[10px] px-4 py-2.5 font-sans text-base leading-[1.4] whitespace-pre-line text-[#323232]",
          mine ? "bg-[#fbefd8] text-right" : "border border-[#d0d0d0] bg-white",
          className
        )}
      >
        {children}
      </div>
      {!mine && time ? (
        <span className="shrink-0 font-sans text-xs text-[#606060]">
          {time}
        </span>
      ) : null}
    </div>
  );
}
