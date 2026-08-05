import { BrandMark } from "@/components/molecules/BrandMark";
import { MainCategoryNav, MainSearchBar } from "@/components/organisms";
import { cn } from "@/lib/utils";

interface MainTemplateProps {
  className?: string;
}

export function MainTemplate({ className }: MainTemplateProps) {
  return (
    <main
      className={cn(
        "mx-auto flex w-full max-w-[1240px] flex-1 flex-col items-center px-5 pb-16 pt-[108px] sm:px-8 md:pb-20 md:pt-[84px]",
        className
      )}
    >
      <BrandMark />

      <MainSearchBar className="mt-24 w-full md:mt-[210px]" />

      <MainCategoryNav className="mt-12 w-full md:mt-14" />

      <div
        aria-label="광고 배너"
        className="mt-16 flex h-32 w-full max-w-[1000px] items-center justify-center bg-[#d9d9d9] font-sans text-2xl text-black md:mt-24 md:h-40 md:text-3xl"
      >
        광고배너
      </div>
    </main>
  );
}
