import { cn } from "@/lib/utils";

interface AuthDividerProps {
  label: string;
  className?: string;
}

export function AuthDivider({ label, className }: AuthDividerProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 text-xs text-vh-gray-500",
        className
      )}
    >
      <span aria-hidden className="h-px flex-1 bg-vh-gray-700" />
      <span>{label}</span>
      <span aria-hidden className="h-px flex-1 bg-vh-gray-700" />
    </div>
  );
}
