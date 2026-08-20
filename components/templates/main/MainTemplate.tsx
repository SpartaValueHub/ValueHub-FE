import { MainBottomNav } from "@/components/organisms/main/MainBottomNav";
import { MainCategorySection } from "@/components/organisms/main/MainCategorySection";
import { MainHeroSection } from "@/components/organisms/main/MainHeroSection";
import { MainRecommendedProducts } from "@/components/organisms/main/MainRecommendedProducts";
import { cn } from "@/lib/utils";

interface MainTemplateProps {
  className?: string;
}

export function MainTemplate({ className }: MainTemplateProps) {
  return (
    <main
      className={cn(
        "flex flex-1 flex-col bg-[#323232] pb-24 md:pb-[200px]",
        className
      )}
    >
      <div className="flex flex-col gap-[100px] md:gap-[200px]">
        <MainHeroSection />

        <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-[100px] px-5 md:gap-[200px] md:px-10">
          <MainCategorySection />
          <MainRecommendedProducts />
        </div>
      </div>

      <MainBottomNav />
    </main>
  );
}
