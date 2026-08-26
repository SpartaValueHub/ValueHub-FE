import Link from "next/link";

import { cn } from "@/lib/utils";

interface AuthHelperLinksProps {
  className?: string;
}

/** 아이디 찾기 · 비밀번호 찾기 · 회원가입 */
export function AuthHelperLinks({ className }: AuthHelperLinksProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-center gap-5 text-xs text-[#d0d0d0] md:gap-2 md:text-vh-gray-500",
        className
      )}
    >
      <button
        type="button"
        disabled
        className="cursor-not-allowed opacity-60"
        title="준비 중"
      >
        아이디 찾기
      </button>
      <span aria-hidden className="text-vh-gray-700">
        |
      </span>
      <button
        type="button"
        disabled
        className="cursor-not-allowed opacity-60"
        title="준비 중"
      >
        비밀번호 찾기
      </button>
      <span aria-hidden className="text-vh-gray-700">
        |
      </span>
      <Link href="/signup" className="transition-colors hover:text-vh-gold-500">
        회원가입
      </Link>
    </div>
  );
}
