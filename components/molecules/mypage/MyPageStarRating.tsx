import { Icon } from "@/components/atoms/icons";
import { cn } from "@/lib/utils";

interface MyPageStarRatingProps {
  score: number;
  max?: number;
  className?: string;
}

export function MyPageStarRating({
  score,
  max = 5,
  className,
}: MyPageStarRatingProps) {
  return (
    <div className={cn("flex items-center gap-[3px]", className)}>
      {Array.from({ length: max }, (_, index) => (
        <Icon
          key={index}
          name="star-fill"
          size={16}
          className={index < score ? undefined : "opacity-30"}
        />
      ))}
      <span className="font-sans text-base font-medium text-white">
        {score}
      </span>
    </div>
  );
}
