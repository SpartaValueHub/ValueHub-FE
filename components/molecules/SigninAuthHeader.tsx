import { BrandLogoIcon } from "@/components/molecules/BrandLogoIcon";
import { cn } from "@/lib/utils";

interface SigninAuthHeaderProps {
  className?: string;
}

/** 로그인 — 에셋 로고 + 2줄 Welcome (중앙 정렬) */
export function SigninAuthHeader({ className }: SigninAuthHeaderProps) {
  return (
    <header
      className={cn(
        "flex w-full flex-col items-center gap-5 text-center",
        className
      )}
    >
      <BrandLogoIcon size="lg" />

      <div className="flex flex-col gap-0.5">
        <h1 className="font-serif text-[1.75rem] font-semibold leading-snug tracking-tight text-vh-brand-gold md:text-[1.85rem]">
          Welcome to
        </h1>
        <h1 className="font-serif text-[1.75rem] font-semibold leading-snug tracking-tight text-vh-brand-gold md:text-[1.85rem]">
          Value hub
        </h1>
      </div>

      <p className="font-sans text-sm text-vh-gray-500 md:text-vh-base">
        회원 서비스 이용을 위해 로그인 해주세요.
      </p>
    </header>
  );
}
