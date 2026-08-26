import { BrandLogoIcon } from "@/components/molecules/brand/BrandLogoIcon";
import { cn } from "@/lib/utils";

interface SigninAuthHeaderProps {
  className?: string;
}

/** 로그인 — 모바일 중앙 타이틀 / PC 로고+좌측 Welcome */
export function SigninAuthHeader({ className }: SigninAuthHeaderProps) {
  return (
    <header className={cn("w-full", className)}>
      <div className="flex flex-col items-center text-center md:inline-grid md:grid-cols-[auto_1fr] md:items-center md:gap-x-4 md:gap-y-0.5 md:text-left">
        <BrandLogoIcon
          size="lg"
          className="hidden md:row-span-2 md:block md:self-center"
        />

        <h1 className="font-serif text-2xl font-bold leading-[1.4] tracking-tight text-vh-brand-gold md:row-span-2 md:self-center md:text-[1.85rem] md:font-semibold md:leading-snug">
          Welcome to
          <br />
          Value hub
        </h1>

        <p className="mt-2.5 font-sans text-xs tracking-[-0.6px] text-[#ababab] md:col-start-2 md:row-start-3 md:mt-3 md:text-vh-base md:tracking-normal md:text-vh-gray-500">
          회원 서비스 이용을 위해 로그인 해주세요.
        </p>
      </div>
    </header>
  );
}
