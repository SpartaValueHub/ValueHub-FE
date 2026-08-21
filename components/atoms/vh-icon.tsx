import Image from "next/image";

import { cn } from "@/lib/utils";

interface VhIconProps {
  src: string;
  width: number;
  height: number;
  alt?: string;
  className?: string;
}

/** 로컬 SVG 아이콘 — Figma 내보내기 애셋 */
function VhIcon({ src, width, height, alt = "", className }: VhIconProps) {
  return (
    <span
      className={cn("relative inline-block shrink-0 overflow-clip", className)}
      style={{ width, height }}
    >
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        unoptimized
        className="size-full object-contain"
      />
    </span>
  );
}

export { VhIcon };
export type { VhIconProps };
