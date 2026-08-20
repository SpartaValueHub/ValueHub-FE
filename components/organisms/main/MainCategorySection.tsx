import Image from "next/image";

import { MainCategoryGridCard } from "@/components/molecules/main/MainCategoryGridCard";
import { MainCategoryImageTile } from "@/components/molecules/main/MainCategoryImageTile";
import { MainSectionHeader } from "@/components/molecules/main/MainSectionHeader";
import { MAIN_CATEGORIES } from "@/constants/main-page";
import { cn } from "@/lib/utils";

interface MainCategorySectionProps {
  className?: string;
}

export function MainCategorySection({ className }: MainCategorySectionProps) {
  const sideImage = MAIN_CATEGORIES.find(
    (category) => category.sideImage
  )?.sideImage;

  return (
    <section
      aria-label="카테고리"
      className={cn("flex w-full flex-col gap-2.5 md:gap-5", className)}
    >
      <MainSectionHeader title="카테고리" viewAllHref="#" />

      {/* Mobile — 2×2 image tiles */}
      <div className="grid grid-cols-2 gap-[5px] lg:hidden">
        {MAIN_CATEGORIES.map((category) => (
          <MainCategoryImageTile key={category.id} category={category} />
        ))}
      </div>

      {/* Desktop — side image + 2×2 grid */}
      <div className="hidden w-full lg:flex lg:items-stretch">
        {sideImage ? (
          <div className="relative min-h-[754px] w-[36%] shrink-0">
            <Image
              src={sideImage}
              alt=""
              fill
              sizes="520px"
              className="object-cover"
            />
          </div>
        ) : null}

        <div className="grid w-[64%] shrink-0 grid-cols-2">
          {MAIN_CATEGORIES.map((category) => (
            <MainCategoryGridCard key={category.id} category={category} />
          ))}
        </div>
      </div>
    </section>
  );
}
