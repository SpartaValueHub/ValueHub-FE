import { VerticalDivider } from "@/components/atoms/vertical-divider";
import { TextUnderlineLink } from "@/components/molecules/TextUnderlineLink";
import { cn } from "@/lib/utils";

interface HeaderAuthLinksProps {
  isAuthenticated: boolean;
  isLoading?: boolean;
  onLogout?: () => void;
  className?: string;
}

/** 헤더 auth 링크 — guest: 회원가입|로그인 / login: 마이페이지|로그아웃 */
export function HeaderAuthLinks({
  isAuthenticated,
  isLoading,
  onLogout,
  className,
}: HeaderAuthLinksProps) {
  if (isLoading) {
    return (
      <div className={cn("flex items-center gap-2.5", className)}>
        <span aria-hidden className="inline-block h-7 min-w-16" />
        <span aria-hidden className="inline-block h-7 min-w-16" />
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className={cn("flex items-center gap-2.5", className)}>
        <TextUnderlineLink href="#" variant="header">
          마이페이지
        </TextUnderlineLink>
        <VerticalDivider size="md" className="bg-[#e0e0e0]/40" />
        <button
          type="button"
          onClick={onLogout}
          className="px-2 py-1 font-sans text-sm text-[#e0e0e0] transition-colors hover:text-vh-brand-gold"
        >
          로그아웃
        </button>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <TextUnderlineLink href="/signup" variant="header">
        회원가입
      </TextUnderlineLink>
      <VerticalDivider size="md" className="bg-[#e0e0e0]/40" />
      <TextUnderlineLink href="/signin" variant="header">
        로그인
      </TextUnderlineLink>
    </div>
  );
}
