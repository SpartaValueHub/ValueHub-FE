import { Button } from "@/components/atoms/button";
import { APPOINTMENT_NOTIFICATION_OPTIONS } from "@/constants/chat-appointment";
import { cn } from "@/lib/utils";

interface AppointmentNotificationSectionProps {
  enabled: boolean;
  minutes: number;
  onEnabledChange: (enabled: boolean) => void;
  onMinutesChange: (minutes: number) => void;
}

export function AppointmentNotificationSection({
  enabled,
  minutes,
  onEnabledChange,
  onMinutesChange,
}: AppointmentNotificationSectionProps) {
  return (
    <div className="space-y-4 border-t border-[#e8e8e8] pt-5">
      <div className="flex items-center justify-between">
        <span className="font-sans text-sm text-[#323232]">알림 설정하기</span>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          onClick={() => onEnabledChange(!enabled)}
          className={cn(
            "relative h-6 w-11 rounded-full transition-colors",
            enabled ? "bg-vh-brand-gold" : "bg-[#d9d9d9]"
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform",
              enabled ? "left-[22px]" : "left-0.5"
            )}
          />
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {APPOINTMENT_NOTIFICATION_OPTIONS.map((option) => (
          <Button
            key={option.minutes}
            type="button"
            variant={minutes === option.minutes ? "brand-solid" : "brand"}
            size="sm"
            disabled={!enabled}
            className="h-9 rounded-full px-4 text-sm"
            onClick={() => onMinutesChange(option.minutes)}
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
