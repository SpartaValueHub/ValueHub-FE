"use client";

import Image from "next/image";
import { useCallback, useState } from "react";

import { Icon } from "@/components/atoms/icons";
import { cn } from "@/lib/utils";

export type ProductSliderSlide = {
  id: string;
  url: string;
  /** 서류 슬라이드 라벨 (영수증·보증서·감정서) — 상품 이미지는 생략 */
  label?: string | null;
};

interface ProductImageSliderProps {
  slides: ProductSliderSlide[];
  productName: string;
  className?: string;
}

/** Figma product_detail thumbnail — 정사각 + 좌우 화살표 + 하단 인디케이터 */
export function ProductImageSlider({
  slides,
  productName,
  className,
}: ProductImageSliderProps) {
  const [current, setCurrent] = useState(0);
  const total = slides.length;
  const active = slides[current];

  const prev = useCallback(
    () => setCurrent((i) => (i <= 0 ? total - 1 : i - 1)),
    [total]
  );
  const next = useCallback(
    () => setCurrent((i) => (i >= total - 1 ? 0 : i + 1)),
    [total]
  );

  if (total === 0) {
    return (
      <div
        className={cn(
          "flex aspect-square w-full items-center justify-center border border-[#e0e0e0] bg-[#e0e0e0]",
          className
        )}
      >
        <span className="text-sm text-vh-gray-500">이미지 없음</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative aspect-square w-full overflow-hidden border border-[#e0e0e0] bg-[#e0e0e0]",
        className
      )}
    >
      {slides.map((slide, idx) => (
        <div
          key={slide.id}
          className={cn(
            "absolute inset-0 transition-opacity duration-300",
            idx === current ? "opacity-100" : "pointer-events-none opacity-0"
          )}
        >
          <Image
            src={slide.url}
            alt={
              slide.label
                ? `${productName} ${slide.label}`
                : `${productName} ${idx + 1}`
            }
            fill
            unoptimized
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 600px"
            priority={idx === 0}
          />
        </div>
      ))}

      {active?.label ? (
        <span className="absolute left-2.5 top-2.5 z-10 rounded-[3px] bg-[rgba(50,50,50,0.65)] px-2 py-1 font-sans text-xs tracking-[-0.24px] text-white md:text-sm">
          {active.label}
        </span>
      ) : null}

      {total > 1 ? (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="이전 이미지"
            className="absolute left-2.5 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center bg-white/30"
          >
            <Icon name="chevron-left" size={24} className="text-[#323232]" />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="다음 이미지"
            className="absolute right-2.5 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center bg-white/30"
          >
            <Icon name="chevron-right" size={24} className="text-[#323232]" />
          </button>
        </>
      ) : null}

      <div
        className="absolute bottom-[30px] left-1/2 z-10 flex min-w-[4.5rem] -translate-x-1/2 items-center justify-center gap-px rounded-[3px] bg-[rgba(50,50,50,0.5)] px-1.5 py-0.5 font-sans text-base leading-none tabular-nums"
        aria-live="polite"
      >
        <span className="inline-block min-w-[1.25em] text-right text-white">
          {current + 1}
        </span>
        <span className="text-[#d9d9d9]">/</span>
        <span className="inline-block min-w-[1.25em] text-left text-[#d9d9d9]">
          {total}
        </span>
      </div>
    </div>
  );
}
