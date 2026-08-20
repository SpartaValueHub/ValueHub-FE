import { VhIcon } from "@/components/atoms/vh-icon";
import { cn } from "@/lib/utils";

type SideAction = "top" | "write";

interface SideActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  action: SideAction;
  expanded?: boolean;
}

const ACTION_CONFIG: Record<
  SideAction,
  { icon: string; iconSize: { width: number; height: number }; label: string }
> = {
  top: {
    icon: "/icons/side-top-arrow.svg",
    iconSize: { width: 16, height: 8 },
    label: "TOP",
  },
  write: {
    icon: "/icons/side-edit.svg",
    iconSize: { width: 24, height: 24 },
    label: "글쓰기",
  },
};

/** Figma 사이드버튼 — 원형 default, hover 시 라벨 확장 */
export function SideActionButton({
  action,
  expanded = false,
  className,
  ...props
}: SideActionButtonProps) {
  const config = ACTION_CONFIG[action];
  const isTop = action === "top";

  return (
    <button
      type="button"
      aria-label={config.label}
      data-expanded={expanded || undefined}
      className={cn(
        "group/side inline-flex items-center justify-center rounded-[35px] bg-white font-sans text-sm font-light text-black transition-all",
        isTop
          ? cn(
              "size-12 hover:h-[100px] hover:w-12 hover:flex-col hover:justify-between hover:bg-[#fbefd8] hover:py-[17px]",
              expanded &&
                "h-[100px] w-12 flex-col justify-between bg-[#fbefd8] py-[17px]"
            )
          : cn(
              "size-12 hover:h-12 hover:w-[110px] hover:justify-between hover:bg-[#fbefd8] hover:pl-2.5 hover:pr-[15px]",
              expanded &&
                "h-12 w-[110px] justify-between bg-[#fbefd8] pl-2.5 pr-[15px]"
            ),
        className
      )}
      {...props}
    >
      <VhIcon
        src={config.icon}
        width={config.iconSize.width}
        height={config.iconSize.height}
      />
      <span
        className={cn(
          "whitespace-nowrap",
          expanded ? "inline" : "hidden group-hover/side:inline"
        )}
      >
        {config.label}
      </span>
    </button>
  );
}
