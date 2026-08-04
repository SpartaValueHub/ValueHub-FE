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
        "mx-auto flex w-full max-w-5xl flex-1 flex-col items-center gap-10 px-4 pb-12 pt-6 md:gap-14 md:pb-16 md:pt-10",
        className
      )}
    >
      <BrandMark />

      <MainSearchBar className="mt-2 w-full" />

      <MainCategoryNav className="mt-2 w-full" />

      <div
        aria-label="광고 배너"
        className="mt-auto flex h-32 w-full max-w-4xl items-center justify-center rounded-sm bg-vh-gray-300 text-base text-vh-gray-700 md:h-44 md:text-lg"
      >
        광고배너
      </div>
    </main>
  );
}
