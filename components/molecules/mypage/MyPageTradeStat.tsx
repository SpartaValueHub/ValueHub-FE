import { cn } from "@/lib/utils";

interface MyPageTradeStatProps {
  label: string;
  value: number;
  size?: "sm" | "md";
  className?: string;
}

export function MyPageTradeStat({
  label,
  value,
  size = "md",
  className,
}: MyPageTradeStatProps) {
  const isSm = size === "sm";

  return (
    <div
      className={cn(
        "flex min-w-0 flex-col items-center whitespace-nowrap",
        isSm ? "gap-2.5" : "h-40 flex-1 gap-[50px]",
        className
      )}
    >
      <p
        className={cn(
          "font-sans text-[#f5f5f5]",
          isSm ? "text-sm" : "text-base"
        )}
      >
        {label}
      </p>
      <div className="flex items-end">
        <span
          className={cn(
            "font-sans leading-none text-[#f5f5f5]",
            isSm ? "text-xl" : "text-[50px]"
          )}
        >
          {value}
        </span>
        <span
          className={cn(
            "font-sans leading-none text-[#f5f5f5]",
            isSm ? "text-base" : "pb-1.5 text-[30px]"
          )}
        >
          건
        </span>
      </div>
    </div>
  );
}
