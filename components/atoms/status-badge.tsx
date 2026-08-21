import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const statusBadgeVariants = cva(
  "inline-flex items-center justify-center rounded-[2px] px-1 py-0.5 font-sans text-[10px] leading-normal tracking-[-0.2px]",
  {
    variants: {
      status: {
        reserved: "bg-[#fbefd8] text-[#323232]",
        sold: "bg-[#808080] text-[#d0d0d0]",
        selling: "border border-[#f5f5f5] bg-white text-[#323232]",
        document: "bg-[#d8dbcd] text-[#323232]",
      },
    },
    defaultVariants: {
      status: "selling",
    },
  }
);

const STATUS_LABEL: Record<
  NonNullable<VariantProps<typeof statusBadgeVariants>["status"]>,
  string
> = {
  reserved: "예약중",
  sold: "판매완료",
  selling: "판매중",
  document: "서류",
};

interface StatusBadgeProps
  extends
    VariantProps<typeof statusBadgeVariants>,
    Omit<React.ComponentProps<"span">, "children"> {
  label?: string;
}

/** Figma 판매상태 뱃지 — 예약중 / 판매완료 / 판매중 */
function StatusBadge({
  status = "selling",
  label,
  className,
  ...props
}: StatusBadgeProps) {
  const resolvedStatus = status ?? "selling";

  return (
    <span
      data-slot="status-badge"
      className={cn(statusBadgeVariants({ status: resolvedStatus }), className)}
      {...props}
    >
      {label ?? STATUS_LABEL[resolvedStatus]}
    </span>
  );
}

export { StatusBadge, statusBadgeVariants };
export type { StatusBadgeProps };
