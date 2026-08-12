import { cn } from "@/lib/utils";

interface SignupAuthHeaderProps {
  className?: string;
  resumeMode?: boolean;
}

/** 회원가입 — 에셋 로고 + 2줄 타이틀 (좌측 정렬) */
export function SignupAuthHeader({
  className,
  resumeMode = false,
}: SignupAuthHeaderProps) {
  return (
    <header className={cn("flex w-full justify-center text-center", className)}>
      <div className="flex flex-col items-center">
        <h1 className="font-serif text-[1.75rem] font-semibold leading-snug tracking-tight text-vh-brand-gold md:text-[1.85rem]">
          Sign up for
        </h1>
        <h1 className="font-serif text-[1.75rem] font-semibold leading-snug tracking-tight text-vh-brand-gold md:text-[1.85rem]">
          Value hub
        </h1>

        {resumeMode ? (
          <p className="mt-3 font-sans text-sm text-vh-gray-500">
            이전에 중단된 가입을 이어서 완료해 주세요.
          </p>
        ) : null}
      </div>
    </header>
  );
}
