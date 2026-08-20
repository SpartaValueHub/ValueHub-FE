import { cn } from "@/lib/utils";

function formatBadgeCount(count: number) {
  return count > 99 ? "99+" : String(count);
}

interface HeaderIconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  badgeCount?: number;
  children: React.ReactNode;
}

/** 헤더 아이콘 버튼 — search·알림·채팅 + 알림 뱃지 */
export function HeaderIconButton({
  label,
  badgeCount,
  children,
  className,
  ...props
}: HeaderIconButtonProps) {
  const count = badgeCount ?? 0;
  const showBadge = count > 0;
  const badgeLabel = showBadge ? formatBadgeCount(count) : null;

  return (
    <button
      type="button"
      aria-label={showBadge ? `${label} ${formatBadgeCount(count)}` : label}
      className={cn(
        "relative flex size-[30px] items-center justify-center text-[#e0e0e0] transition-colors hover:text-vh-brand-gold",
        className
      )}
      {...props}
    >
      {children}
      {badgeLabel ? (
        <span
          aria-hidden
          className={cn(
            "absolute -top-1 left-[23px] inline-flex min-w-[14px] items-center justify-center rounded-[18px] bg-[#e97c00] px-[3px] py-[2px] font-sans text-[8px] leading-none tracking-[-0.16px] text-white",
            count > 99 && "border-2 border-[#323232]"
          )}
        >
          {badgeLabel}
        </span>
      ) : null}
    </button>
  );
}
