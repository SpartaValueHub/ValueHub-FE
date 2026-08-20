import { MapPin } from "lucide-react";

import { cn } from "@/lib/utils";

interface AppointmentMapPreviewProps {
  label?: string;
  className?: string;
  large?: boolean;
}

export function AppointmentMapPreview({
  label = "지도",
  className,
  large = false,
}: AppointmentMapPreviewProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-sm bg-[#e8e8e8]",
        large ? "min-h-[280px] w-full" : "min-h-[220px] w-full md:w-[280px]",
        className
      )}
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(#ccc 1px, transparent 1px), linear-gradient(90deg, #ccc 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center font-sans text-sm text-[#868686]">
        {label}
      </div>
      <MapPin
        className="absolute top-1/2 left-1/2 size-8 -translate-x-1/2 -translate-y-full text-orange-500"
        fill="currentColor"
        strokeWidth={1.5}
      />
    </div>
  );
}
