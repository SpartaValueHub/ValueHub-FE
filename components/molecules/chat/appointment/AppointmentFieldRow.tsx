import { ChevronRight, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface AppointmentFieldRowProps {
  icon: LucideIcon;
  label: string;
  value: string;
  onClick?: () => void;
  showChevron?: boolean;
  className?: string;
}

export function AppointmentFieldRow({
  icon: Icon,
  label,
  value,
  onClick,
  showChevron = false,
  className,
}: AppointmentFieldRowProps) {
  const Component = onClick ? "button" : "div";
  const isInteractive = Boolean(onClick) || showChevron;

  return (
    <Component
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 border-b border-[#e8e8e8] py-4 text-left transition-colors",
        isInteractive && "hover:bg-[#fafafa]",
        className
      )}
    >
      <Icon className="size-5 shrink-0 text-[#868686]" strokeWidth={1.5} />
      <span className="w-12 shrink-0 font-sans text-sm text-[#868686]">
        {label}
      </span>
      <span
        className={cn(
          "min-w-0 flex-1 font-sans text-sm",
          value.includes("선택") ? "text-[#ababab]" : "text-[#323232]"
        )}
      >
        {value}
      </span>
      {isInteractive ? (
        <ChevronRight className="size-4 shrink-0 text-[#868686]" />
      ) : null}
    </Component>
  );
}
