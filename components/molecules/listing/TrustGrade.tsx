import { VhIcon } from "@/components/atoms/vh-icon";
import { cn } from "@/lib/utils";

export type TrustGradeLevel =
  "bronze" | "silver" | "gold" | "platinum" | "diamond";

const TRUST_GRADE: Record<TrustGradeLevel, { src: string; label: string }> = {
  bronze: { src: "/icons/trust/bronze.svg", label: "bronze" },
  silver: { src: "/icons/trust/silver.svg", label: "silver" },
  gold: { src: "/icons/trust/gold.svg", label: "gold" },
  platinum: { src: "/icons/trust/platinum.svg", label: "platinum" },
  diamond: { src: "/icons/trust/diamond.svg", label: "diamond" },
};

interface TrustGradeProps {
  level: TrustGradeLevel;
  showLabel?: boolean;
  iconWidth?: number;
  iconHeight?: number;
  className?: string;
}

/** Figma 거래안심등급 — bronze ~ diamond 쉐브론 아이콘 */
export function TrustGrade({
  level,
  showLabel = true,
  iconWidth = 61,
  iconHeight = 82,
  className,
}: TrustGradeProps) {
  const grade = TRUST_GRADE[level];

  return (
    <div
      className={cn(
        "inline-flex flex-col items-center justify-end gap-2.5",
        className
      )}
    >
      <VhIcon src={grade.src} width={iconWidth} height={iconHeight} />
      {showLabel ? (
        <p className="font-sans text-base leading-[2] text-black">
          {grade.label}
        </p>
      ) : null}
    </div>
  );
}

export const TRUST_GRADE_LEVELS: TrustGradeLevel[] = [
  "bronze",
  "silver",
  "gold",
  "platinum",
  "diamond",
];
