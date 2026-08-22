import Link from "next/link";

import type { MainCategoryDetail } from "@/constants/main-page";
import { headerCategoryNavHref } from "@/constants/product-posts";
import { cn } from "@/lib/utils";

interface MainCategoryGridCardProps {
  category: MainCategoryDetail;
  className?: string;
  onHover?: () => void;
}

export function MainCategoryGridCard({
  category,
  className,
  onHover,
}: MainCategoryGridCardProps) {
  return (
    <Link
      href={headerCategoryNavHref(category.id)}
      onMouseEnter={onHover}
      className={cn(
        "group flex h-[377px] w-full flex-col items-center justify-center gap-[30px] px-12 py-[70px]",
        "border border-[#606060] bg-[#323232] text-vh-gray-100",
        "hover:border-transparent hover:bg-white/90 hover:text-[#323232]",
        className
      )}
    >
      <h3 className="font-sans text-[36px] font-normal leading-none">
        {category.title}
      </h3>

      <div className="text-center font-sans text-base leading-[1.4] tracking-[-0.32px] text-[#f5f5f5] group-hover:text-[#606060]">
        {category.descriptions.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>

      <span
        className={cn(
          "inline-flex items-center font-sans text-sm transition-colors",
          "border-b border-transparent px-2.5 py-1 text-[#f5f5f5]",
          "group-hover:border-[#868686] group-hover:text-[#323232]"
        )}
      >
        상품 보러가기
      </span>
    </Link>
  );
}
