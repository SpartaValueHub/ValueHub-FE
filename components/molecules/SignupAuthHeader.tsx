import { BrandLogoIcon } from "@/components/molecules/BrandLogoIcon";
import { cn } from "@/lib/utils";

interface SignupAuthHeaderProps {
  className?: string;
}

/** 회원가입 — 에셋 로고 + 2줄 타이틀 (좌측 정렬) */
export function SignupAuthHeader({ className }: SignupAuthHeaderProps) {
  return (
    <header className={cn("w-full", className)}>
      <div className="inline-grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-0.5">
        <BrandLogoIcon size="lg" className="row-span-2 self-center" />

        <h1 className="font-serif text-[1.75rem] font-semibold leading-snug tracking-tight text-vh-brand-gold md:text-[1.85rem]">
          Sign up for
        </h1>
        <h1 className="font-serif text-[1.75rem] font-semibold leading-snug tracking-tight text-vh-brand-gold md:text-[1.85rem]">
          Value hub
        </h1>

        <p className="col-start-2 row-start-3 mt-3 font-sans text-sm text-vh-gray-500 md:text-vh-base">
          회원 정보를 입력해주세요.
        </p>
      </div>
    </header>
  );
}
