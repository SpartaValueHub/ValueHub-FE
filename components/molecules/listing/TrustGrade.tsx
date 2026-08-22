import { cn } from "@/lib/utils";

export type TrustGradeLevel =
  "bronze" | "silver" | "gold" | "platinum" | "diamond";

const TRUST_GRADE: Record<
  TrustGradeLevel,
  { src: string; label: string; color: string }
> = {
  bronze: { src: "/icons/trust/bronze.svg", label: "bronze", color: "#F1DDC6" },
  silver: { src: "/icons/trust/silver.svg", label: "silver", color: "#D0D0D0" },
  gold: { src: "/icons/trust/gold.svg", label: "gold", color: "#F8E3B9" },
  platinum: {
    src: "/icons/trust/platinum.svg",
    label: "platinum",
    color: "#D8DBCD",
  },
  diamond: {
    src: "/icons/trust/diamond.svg",
    label: "diamond",
    color: "#D3D3E0",
  },
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
      <span
        aria-hidden
        className="inline-block shrink-0"
        style={{
          width: iconWidth,
          height: iconHeight,
          backgroundColor: grade.color,
          maskImage: `url(${grade.src})`,
          WebkitMaskImage: `url(${grade.src})`,
          maskSize: "contain",
          WebkitMaskSize: "contain",
          maskRepeat: "no-repeat",
          WebkitMaskRepeat: "no-repeat",
          maskPosition: "center",
          WebkitMaskPosition: "center",
        }}
      />
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
