"use client";

import { useState } from "react";
import Image from "next/image";

import { MainCategoryGridCard } from "@/components/molecules/main/MainCategoryGridCard";
import { MainCategoryImageTile } from "@/components/molecules/main/MainCategoryImageTile";
import { MainSectionHeader } from "@/components/molecules/main/MainSectionHeader";
import {
  MAIN_CATEGORIES,
  MAIN_CATEGORY_DEFAULT_SIDE_IMAGE,
} from "@/constants/main-page";
import { PRODUCT_POSTS_PATH } from "@/constants/product-posts";
import { cn } from "@/lib/utils";

interface MainCategorySectionProps {
  className?: string;
}

const SIDE_IMAGES = [
  { id: "default", src: MAIN_CATEGORY_DEFAULT_SIDE_IMAGE, alt: "" },
  ...MAIN_CATEGORIES.map((category) => ({
    id: category.id,
    src: category.sideImage,
    alt: category.title,
  })),
];

export function MainCategorySection({ className }: MainCategorySectionProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const activeImageId = hoveredId ?? "default";

  return (
    <section
      aria-label="카테고리"
      className={cn("flex w-full flex-col gap-2.5 md:gap-5", className)}
    >
      <MainSectionHeader title="카테고리" viewAllHref={PRODUCT_POSTS_PATH} />

      {/* Mobile — 2×2 image tiles */}
      <div className="grid grid-cols-2 gap-[5px] lg:hidden">
        {MAIN_CATEGORIES.map((category) => (
          <MainCategoryImageTile key={category.id} category={category} />
        ))}
      </div>

      {/* Desktop — side image + 2×2 grid */}
      <div className="hidden w-full lg:flex lg:items-stretch">
        <div className="relative min-h-[754px] w-[36%] shrink-0">
          {SIDE_IMAGES.map((image) => (
            <Image
              key={image.id}
              src={image.src}
              alt={image.alt}
              fill
              sizes="520px"
              className={cn(
                "object-cover transition-opacity duration-300",
                image.id === activeImageId
                  ? "opacity-100"
                  : "pointer-events-none opacity-0"
              )}
              priority={image.id === "default"}
            />
          ))}
        </div>

        <div
          className="grid w-[64%] shrink-0 grid-cols-2"
          onMouseLeave={() => setHoveredId(null)}
        >
          {MAIN_CATEGORIES.map((category) => (
            <MainCategoryGridCard
              key={category.id}
              category={category}
              onHover={() => setHoveredId(category.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
