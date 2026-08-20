import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group/button inline-flex shrink-0 cursor-pointer items-center justify-center border bg-clip-padding font-sans font-normal whitespace-nowrap transition-all outline-none select-none focus-visible:ring-2 focus-visible:ring-vh-brand-gold/40 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "rounded-lg border-transparent bg-primary text-primary-foreground hover:bg-primary/80 disabled:opacity-50",
        outline:
          "rounded-lg border-border bg-background hover:bg-muted hover:text-foreground disabled:opacity-50 dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        secondary:
          "rounded-lg border-transparent bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] disabled:opacity-50",
        ghost:
          "rounded-none border-transparent bg-transparent hover:bg-muted hover:text-foreground disabled:opacity-50 dark:hover:bg-muted/50",
        destructive:
          "rounded-lg border-transparent bg-destructive/10 text-destructive hover:bg-destructive/20 disabled:opacity-50",
        link: "rounded-none border-transparent bg-transparent text-primary underline-offset-4 hover:underline disabled:opacity-50",
        /** Figma default/inactive · default hover · disabled */
        brand:
          "rounded-none border-[#868686] bg-transparent text-[#f5f5f5] hover:border-[#868686] hover:bg-[rgba(134,134,134,0.3)] hover:text-white disabled:border-[#606060] disabled:bg-transparent disabled:text-[#606060] disabled:opacity-100 disabled:hover:bg-transparent",
        /** Figma active · active hover · disabled */
        "brand-solid":
          "rounded-none border-transparent bg-[#f2ca7b] text-[#323232] hover:border-transparent hover:bg-white hover:text-[#323232] disabled:border-[#606060] disabled:bg-transparent disabled:text-[#606060] disabled:opacity-100 disabled:hover:bg-transparent",
        "brand-green":
          "rounded-none border-vh-green-500 bg-transparent text-vh-green-500 hover:bg-vh-green-500 hover:text-vh-gray-100 disabled:opacity-50",
        "brand-purple":
          "rounded-none border-vh-purple-500 bg-transparent text-vh-purple-500 hover:bg-vh-purple-500 hover:text-vh-gray-100 disabled:opacity-50",
        /** Figma 모달 버튼 — 흰 배경 + #d0d0d0 보더 */
        modal:
          "rounded-[4px] border-[#d0d0d0] bg-white text-[#323232] hover:bg-[#f5f5f5] disabled:opacity-50",
        /** Figma 모달 확인(채워짐) — #f5f5f5 */
        "modal-filled":
          "rounded-[4px] border-[#d0d0d0] bg-[#f5f5f5] text-[#323232] hover:bg-[#ebebeb] disabled:opacity-50",
      },
      size: {
        default: "h-auto gap-1.5 px-8 py-4 text-xl",
        xs: "h-6 gap-1 px-2 text-xs",
        sm: "h-7 gap-1 px-2.5 text-sm",
        lg: "h-12 gap-1.5 px-8 text-base",
        modal: "h-[57px] gap-1 px-2.5 text-lg",
        icon: "size-8 p-0",
        "icon-xs": "size-6 p-0",
        "icon-sm": "size-7 p-0",
        "icon-lg": "size-9 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
