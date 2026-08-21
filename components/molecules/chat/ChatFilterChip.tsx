import { cn } from "@/lib/utils";

interface ChatFilterChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
}

/** 채팅 목록 필터 칩 — 선택됨 #323232 / 선택안됨 보더 #ababab */
export function ChatFilterChip({
  selected = false,
  className,
  children,
  type = "button",
  ...props
}: ChatFilterChipProps) {
  return (
    <button
      type={type}
      aria-pressed={selected}
      className={cn(
        "inline-flex h-[30px] items-center justify-center rounded-[41px] px-2.5 py-1.5 font-sans text-sm whitespace-nowrap",
        selected
          ? "bg-[#323232] text-white"
          : "border border-[#ababab] bg-transparent text-[#323232]",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
