import { cn } from "@/lib/utils";

interface EmptyProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

/** 데이터 없음 / 검색 결과 없음 공통 */
export function Empty({
  title,
  description,
  icon,
  action,
  className,
}: EmptyProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 px-6 py-12 text-center",
        className
      )}
    >
      {icon ? (
        <div className="text-[#868686]" aria-hidden>
          {icon}
        </div>
      ) : null}
      <p className="font-sans text-base text-vh-gray-100">{title}</p>
      {description ? (
        <p className="max-w-sm font-sans text-sm text-[#868686]">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
