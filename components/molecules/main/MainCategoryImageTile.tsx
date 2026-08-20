import Image from "next/image";
import Link from "next/link";

import type { MainCategoryDetail } from "@/constants/main-page";
import { cn } from "@/lib/utils";

interface MainCategoryImageTileProps {
  category: MainCategoryDetail;
  className?: string;
}

export function MainCategoryImageTile({
  category,
  className,
}: MainCategoryImageTileProps) {
  return (
    <Link
      href="#"
      className={cn(
        "relative flex h-[200px] w-full flex-col items-center justify-center overflow-hidden",
        className
      )}
    >
      <Image
        src={category.tileImage}
        alt=""
        fill
        sizes="(max-width: 768px) 50vw, 165px"
        className="object-cover"
      />
      <span aria-hidden className="absolute inset-0 bg-black/20" />

      <div className="relative flex flex-col items-center gap-1 text-center">
        <span className="font-sans text-lg font-medium text-vh-gray-100 underline decoration-solid underline-offset-4">
          {category.title.charAt(0) + category.title.slice(1).toLowerCase()}
        </span>
        <span className="font-sans text-[10px] text-vh-gray-100">
          {category.shortDescription}
        </span>
      </div>
    </Link>
  );
}
