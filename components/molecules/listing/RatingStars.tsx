import { cn } from "@/lib/utils";

interface RatingStarsProps {
  score: number;
  max?: number;
  className?: string;
}

function StarIcon({ muted = false }: { muted?: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-block size-[26px] bg-[#EFBB55]",
        muted && "opacity-30"
      )}
      style={{
        maskImage: "url(/icons/system/essentials/star-fill.svg)",
        WebkitMaskImage: "url(/icons/system/essentials/star-fill.svg)",
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskPosition: "center",
      }}
    />
  );
}

/** 받은 별점 — #EFBB55 채움, 소수점 비율 반영 */
export function RatingStars({ score, max = 5, className }: RatingStarsProps) {
  const fillPercent = Math.min(Math.max(score / max, 0), 1) * 100;

  return (
    <div className={cn("relative h-[26px] w-[140px]", className)} aria-hidden>
      <div className="flex h-full w-full items-center justify-between">
        {Array.from({ length: max }, (_, index) => (
          <StarIcon key={`empty-${index}`} muted />
        ))}
      </div>
      <div
        className="absolute inset-y-0 left-0 overflow-hidden"
        style={{ width: `${fillPercent}%` }}
      >
        <div className="flex h-full w-[140px] items-center justify-between">
          {Array.from({ length: max }, (_, index) => (
            <StarIcon key={`fill-${index}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
