import { Icon, type SystemIconName } from "@/components/atoms/icons";
import { cn } from "@/lib/utils";

interface ReservationFieldRowProps {
  icon: SystemIconName;
  iconSize?: number;
  label: string;
  placeholder: string;
  onClick?: () => void;
  disabled?: boolean;
}

/** 거래 예약 날짜/시간/장소 행 */
export function ReservationFieldRow({
  icon,
  iconSize = 24,
  label,
  placeholder,
  onClick,
  disabled,
}: ReservationFieldRowProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="flex w-full items-center justify-between py-0.5 text-left disabled:cursor-default"
    >
      <span className="flex min-w-0 items-center gap-2.5">
        <Icon name={icon} size={iconSize} />
        <span
          className={cn(
            "truncate font-sans text-base",
            label ? "text-black" : "text-[#ababab]"
          )}
        >
          {label || placeholder}
        </span>
      </span>
      <Icon name="chevron-right" size={26} />
    </button>
  );
}
