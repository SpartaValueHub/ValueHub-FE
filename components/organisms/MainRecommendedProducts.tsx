"use client";

import { useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { MainSectionHeader } from "@/components/molecules/MainSectionHeader";
import { RecommendedProductCard } from "@/components/molecules/RecommendedProductCard";
import { MAIN_RECOMMENDED_PRODUCTS } from "@/constants/main-page";
import { cn } from "@/lib/utils";

interface MainRecommendedProductsProps {
  className?: string;
}

export function MainRecommendedProducts({
  className,
}: MainRecommendedProductsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollByPage = useCallback((direction: "prev" | "next") => {
    const container = scrollRef.current;
    if (!container) return;

    const offset =
      direction === "next" ? container.clientWidth : -container.clientWidth;
    container.scrollBy({ left: offset, behavior: "smooth" });
  }, []);

  return (
    <section
      aria-label="추천상품"
      className={cn("flex w-full flex-col gap-2.5 md:gap-5", className)}
    >
      <MainSectionHeader
        title="추천상품"
        navSlot={
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              aria-label="이전 추천상품"
              onClick={() => scrollByPage("prev")}
              className="flex size-[23px] items-center justify-center text-vh-gray-100 transition-opacity hover:opacity-70 md:size-10"
            >
              <ChevronLeft className="size-full" strokeWidth={1.25} />
            </button>
            <button
              type="button"
              aria-label="다음 추천상품"
              onClick={() => scrollByPage("next")}
              className="flex size-[23px] items-center justify-center text-vh-gray-100 transition-opacity hover:opacity-70 md:size-10"
            >
              <ChevronRight className="size-full" strokeWidth={1.25} />
            </button>
          </div>
        }
      />

      <div
        ref={scrollRef}
        className="overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <div className="flex gap-2.5 md:gap-[30px]">
          {MAIN_RECOMMENDED_PRODUCTS.map((product) => (
            <RecommendedProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
