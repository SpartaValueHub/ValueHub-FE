import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";

import { VhIcon } from "@/components/atoms/vh-icon";
import { cn } from "@/lib/utils";

const textUnderlineLinkVariants = cva(
  "inline-flex items-center font-sans transition-colors",
  {
    variants: {
      variant: {
        section:
          "border-b border-[#ababab] pb-0.5 text-[10px] text-vh-gray-100 hover:text-vh-brand-gold md:pb-[3px] md:text-sm",
        category:
          "border-b border-[#868686] px-2.5 py-1 text-sm text-[#323232] hover:opacity-80",
        categoryMuted:
          "border-b border-transparent px-2.5 py-1 text-sm text-[#f5f5f5] hover:opacity-80",
        footer: "text-[#868686] hover:text-vh-gray-500",
        header: "px-2 py-1 text-sm text-[#e0e0e0] hover:text-vh-brand-gold",
      },
      showChevron: {
        true: "",
        false: "",
      },
    },
    defaultVariants: {
      variant: "section",
      showChevron: false,
    },
  }
);

interface TextUnderlineLinkProps extends VariantProps<
  typeof textUnderlineLinkVariants
> {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export function TextUnderlineLink({
  href,
  children,
  variant,
  showChevron,
  className,
}: TextUnderlineLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        textUnderlineLinkVariants({ variant, showChevron }),
        className
      )}
    >
      {children}
      {showChevron ? (
        <VhIcon src="/icons/inline-chevron.svg" width={20} height={20} />
      ) : null}
    </Link>
  );
}
