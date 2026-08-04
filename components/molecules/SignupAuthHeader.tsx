import { BrandLogoIcon } from "@/components/molecules/BrandLogoIcon";
import { cn } from "@/lib/utils";

interface SignupAuthHeaderProps {
  className?: string;
}

/** 회원가입 — 에셋 로고 + 2줄 타이틀 (중앙 정렬) */
export function SignupAuthHeader({ className }: SignupAuthHeaderProps) {
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
          Sign up for
        </h1>
        <h1 className="font-serif text-[1.75rem] font-semibold leading-snug tracking-tight text-vh-brand-gold md:text-[1.85rem]">
          Value hub
        </h1>
      </div>

      <p className="font-sans text-sm text-vh-gray-500 md:text-vh-base">
        회원 정보를 입력해주세요.
      </p>
    </header>
  );
}
