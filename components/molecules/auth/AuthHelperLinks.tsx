import Link from "next/link";

import { cn } from "@/lib/utils";

interface AuthHelperLinksProps {
  className?: string;
}

/** 회원가입 링크 */
export function AuthHelperLinks({ className }: AuthHelperLinksProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-center text-xs text-[#d0d0d0] md:text-vh-gray-500",
        className
      )}
    >
      <Link href="/signup" className="transition-colors hover:text-vh-gold-500">
        회원가입
      </Link>
    </div>
  );
}
