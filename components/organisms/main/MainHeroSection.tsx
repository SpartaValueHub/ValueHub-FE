import Image from "next/image";

import { MAIN_SLOGAN } from "@/constants/main-page";
import { cn } from "@/lib/utils";

interface MainHeroSectionProps {
  className?: string;
}

export function MainHeroSection({ className }: MainHeroSectionProps) {
  return (
    <section
      aria-label="메인 히어로"
      className={cn(
        "relative flex min-h-[530px] w-full items-end justify-center overflow-hidden pb-16 pt-32 md:min-h-[700px] md:pb-24 md:pt-40 lg:min-h-[1036px] lg:pb-[120px] lg:pt-48",
        className
      )}
    >
      <Image
        src="/main/hero.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <span aria-hidden className="absolute inset-0 bg-black/30" />

      <div className="relative z-10 flex flex-col items-center text-center">
        <p className="font-sans text-xs text-vh-brand-gold md:text-xl">
          {MAIN_SLOGAN}
        </p>
        <p className="mt-1 font-serif text-xl text-vh-brand-gold md:mt-2 md:text-[46px]">
          Value hub
        </p>
      </div>
    </section>
  );
}
