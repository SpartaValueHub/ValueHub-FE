import { cn } from "@/lib/utils";

interface MyPageFieldRowProps {
  label: string;
  children?: React.ReactNode;
  className?: string;
}

export function MyPageFieldRow({
  label,
  children,
  className,
}: MyPageFieldRowProps) {
  return (
    <div
      className={cn(
        "flex min-h-[33px] items-center justify-between gap-5 lg:justify-start lg:gap-[50px]",
        className
      )}
    >
      <span className="w-[90px] shrink-0 font-sans text-sm text-white lg:w-[100px] lg:text-base">
        {label}
      </span>
      {children}
    </div>
  );
}
