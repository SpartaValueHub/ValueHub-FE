"use client";

import Image from "next/image";
import { useState, useCallback } from "react";

import { cn } from "@/lib/utils";
import type { UiProductPostImage } from "@/types/product-posts/ui";

interface ProductImageSliderProps {
  images: UiProductPostImage[];
  productName: string;
}

function SlideChevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={cn("size-5", direction === "left" && "-scale-x-100")}
      fill="none"
      aria-hidden
    >
      <path
        d="M5 2 L12 9 L5 16"
        stroke="#323232"
        strokeWidth="2.25"
        strokeLinecap="butt"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SlideNavButton({
  direction,
  onClick,
}: {
  direction: "left" | "right";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "absolute top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center",
        direction === "left" ? "left-4" : "right-4"
      )}
      aria-label={direction === "left" ? "이전 이미지" : "다음 이미지"}
    >
      <span
        aria-hidden
        className="absolute inset-0 rounded-sm"
        style={{ backgroundColor: "#FFFFFF", opacity: 0.3 }}
      />
      <span className="relative z-10">
        <SlideChevron direction={direction} />
      </span>
    </button>
  );
}

export function ProductImageSlider({
  images,
  productName,
}: ProductImageSliderProps) {
  const [current, setCurrent] = useState(0);
  const total = images.length;

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
      <div className="flex aspect-square w-full items-center justify-center rounded-lg bg-vh-gray-700">
        <span className="text-sm text-vh-gray-500">이미지 없음</span>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-vh-gray-900">
        {images.map((img, idx) => (
          <div
            key={img.uuid}
            className={cn(
              "absolute inset-0 transition-opacity duration-300",
              idx === current ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
          >
            <Image
              src={img.url}
              alt={`${productName} ${idx + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority={idx === 0}
            />
          </div>
        ))}

        <SlideNavButton direction="left" onClick={prev} />
        <SlideNavButton direction="right" onClick={next} />

        <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center justify-center rounded-[6px] bg-[#828384] px-2.5 py-1 font-sans text-[12px] font-medium leading-none">
          <span className="text-white">{current + 1}</span>
          <span className="text-white/55">/{total}</span>
        </div>
      </div>
    </div>
  );
}
