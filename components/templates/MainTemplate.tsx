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
        "mx-auto flex w-full max-w-5xl flex-1 flex-col items-center gap-8 px-4 pb-16 pt-12 md:gap-10 md:pb-20 md:pt-20",
        className
      )}
    >
      <BrandMark />

      <MainSearchBar className="w-full" />

      <MainCategoryNav className="w-full" />

      <div
        aria-label="광고 배너"
        className="mt-10 flex h-32 w-full max-w-4xl items-center justify-center rounded-sm bg-vh-gray-300 text-base text-vh-gray-700 md:mt-14 md:h-44 md:text-lg"
      >
        광고배너
      </div>
    </main>
  );
}
