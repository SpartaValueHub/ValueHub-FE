import Image from "next/image";

import { cn } from "@/lib/utils";

type ProductCardSize = "pc" | "mobile" | "landing";

interface ProductCardProps {
  name: string;
  image: string;
  size?: ProductCardSize;
  className?: string;
}

const sizeClass: Record<ProductCardSize, string> = {
  pc: "h-[390px] w-[320px] p-5 text-base",
  mobile: "h-[146px] w-[120px] p-2 text-[8px]",
  landing:
    "h-[146px] w-[120px] p-2 text-[8px] md:h-[390px] md:w-[320px] md:p-5 md:text-base",
};

const sizeSizes: Record<ProductCardSize, string> = {
  pc: "320px",
  mobile: "120px",
  landing: "(max-width: 768px) 120px, 320px",
};

/** Figma 상품카드 — 이미지 + 하단 그라데이션 타이틀 */
export function ProductCard({
  name,
  image,
  size = "pc",
  className,
}: ProductCardProps) {
  return (
    <article
      className={cn(
        "relative flex shrink-0 flex-col justify-end overflow-hidden",
        sizeClass[size],
        className
      )}
    >
      <Image
        src={image}
        alt={name}
        fill
        sizes={sizeSizes[size]}
        className="object-cover"
      />
      <span
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-black/0 from-[79%] to-black/70 to-[96%]"
      />
      <p className="relative z-10 line-clamp-2 font-sans text-vh-gray-100">
        {name}
      </p>
    </article>
  );
}
