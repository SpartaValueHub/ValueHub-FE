import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const typographyVariants = cva("", {
  variants: {
    variant: {
      /** Noto Serif KR — 브랜드 타이틀 */
      brand: "font-serif font-semibold tracking-tight",
      /** Pretendard — 카테고리·라벨 */
      category: "font-sans font-medium uppercase tracking-wide",
      /** Ephesis — 장식용 스크립트 */
      script: "font-script font-normal",
      /** Pretendard — 본문 */
      body: "font-sans font-normal",
    },
    size: {
      xs: "text-vh-xs",
      sm: "text-vh-sm",
      base: "text-vh-base",
      lg: "text-vh-lg",
      xl: "text-vh-xl",
      "2xl": "text-vh-2xl",
      "3xl": "text-vh-3xl",
    },
    tone: {
      default: "text-foreground",
      muted: "text-muted-foreground",
      accent: "text-vh-gold-500",
      inverse: "text-vh-gray-100",
    },
  },
  defaultVariants: {
    variant: "body",
    size: "base",
    tone: "default",
  },
});

type TypographyVariantProps = VariantProps<typeof typographyVariants>;

type TypographyProps = TypographyVariantProps & {
  className?: string;
  children?: React.ReactNode;
};

function typographyClassName({
  className,
  variant,
  size,
  tone,
}: TypographyProps) {
  return cn(typographyVariants({ variant, size, tone }), className);
}

/** Noto Serif KR — "Value hub" 브랜드 헤딩 */
function BrandHeading({
  className,
  size = "2xl",
  tone = "default",
  children,
  ...props
}: TypographyProps & React.ComponentProps<"h1">) {
  return (
    <h1
      className={typographyClassName({
        variant: "brand",
        size,
        tone,
        className,
      })}
      {...props}
    >
      {children}
    </h1>
  );
}

/** Pretendard — "Category" 스타일 라벨 */
function CategoryLabel({
  className,
  size = "sm",
  tone = "default",
  children,
  ...props
}: TypographyProps & React.ComponentProps<"span">) {
  return (
    <span
      className={typographyClassName({
        variant: "category",
        size,
        tone,
        className,
      })}
      {...props}
    >
      {children}
    </span>
  );
}

/** Ephesis — 장식용 브랜드 스크립트 */
function BrandScript({
  className,
  size = "3xl",
  tone = "muted",
  children,
  ...props
}: TypographyProps & React.ComponentProps<"span">) {
  return (
    <span
      className={typographyClassName({
        variant: "script",
        size,
        tone,
        className,
      })}
      {...props}
    >
      {children}
    </span>
  );
}

/** Pretendard — 본문 텍스트 */
function BodyText({
  className,
  size = "base",
  tone = "default",
  children,
  ...props
}: TypographyProps & React.ComponentProps<"p">) {
  return (
    <p
      className={typographyClassName({
        variant: "body",
        size,
        tone,
        className,
      })}
      {...props}
    >
      {children}
    </p>
  );
}

export {
  BodyText,
  BrandHeading,
  BrandScript,
  CategoryLabel,
  typographyVariants,
};
