import { TextUnderlineLink } from "@/components/molecules/form/TextUnderlineLink";
import type { MainCategoryDetail } from "@/constants/main-page";
import { cn } from "@/lib/utils";

interface MainCategoryGridCardProps {
  category: MainCategoryDetail;
  className?: string;
}

export function MainCategoryGridCard({
  category,
  className,
}: MainCategoryGridCardProps) {
  const highlighted = category.highlighted;

  return (
    <article
      className={cn(
        "flex h-[377px] w-full flex-col items-center justify-center gap-[30px] px-12 py-[70px]",
        highlighted
          ? "bg-white/90 text-[#323232]"
          : "border border-[#606060] bg-[#323232] text-vh-gray-100",
        className
      )}
    >
      <h3 className="font-sans text-[36px] font-normal leading-none">
        {category.title}
      </h3>

      <div
        className={cn(
          "text-center font-sans text-base leading-[1.4] tracking-[-0.32px]",
          highlighted ? "text-[#606060]" : "text-[#f5f5f5]"
        )}
      >
        {category.descriptions.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>

      <TextUnderlineLink
        href="#"
        variant={highlighted ? "category" : "categoryMuted"}
      >
        상품 보러가기
      </TextUnderlineLink>
    </article>
  );
}
