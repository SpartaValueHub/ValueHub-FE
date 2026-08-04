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
        "mx-auto flex w-full max-w-5xl flex-1 flex-col items-center gap-7 px-4 py-6 md:gap-9 md:py-10",
        className
      )}
    >
      <BrandMark className="gap-3 md:gap-4" />

      <MainSearchBar />

      <MainCategoryNav className="mt-2" />

      <div
        aria-label="광고 배너"
        className="mt-2 flex h-16 w-full max-w-xl items-center justify-center rounded-sm bg-vh-gray-300 text-sm text-vh-gray-700 md:h-20 md:max-w-2xl"
      >
        광고배너
      </div>
    </main>
  );
}
