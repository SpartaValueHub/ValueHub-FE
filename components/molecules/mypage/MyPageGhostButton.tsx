import { Button } from "@/components/atoms/button";
import { cn } from "@/lib/utils";

interface MyPageGhostButtonProps {
  children: React.ReactNode;
  className?: string;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
}

/** 마이페이지 아웃라인 액션 — Button brand (모바일·데스크톱 동일) */
export function MyPageGhostButton({
  children,
  className,
  type = "button",
  onClick,
  disabled,
}: MyPageGhostButtonProps) {
  return (
    <Button
      type={type}
      variant="brand"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "h-auto rounded-none px-[30px] py-2 text-sm text-white hover:text-white",
        className
      )}
    >
      {children}
    </Button>
  );
}
