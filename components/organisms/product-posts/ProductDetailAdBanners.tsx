import Image from "next/image";

import { cn } from "@/lib/utils";

const AD_BANNERS = [
  { src: "/product-detail/ads/ad-1.png", alt: "AD JEWELRY", darkBadge: false },
  {
    src: "/product-detail/ads/ad-2.png",
    alt: "AD Elevate Your Legacy",
    darkBadge: false,
  },
  {
    src: "/product-detail/ads/ad-3.png",
    alt: "AD Year-End Rewards",
    darkBadge: false,
  },
  { src: "/product-detail/ads/ad-4.png", alt: "AD SUMMER", darkBadge: true },
  {
    src: "/product-detail/ads/ad-5.png",
    alt: "AD The New Edit",
    darkBadge: true,
  },
] as const;

interface ProductDetailAdBannersProps {
  className?: string;
}

/** Figma product_detail AD 배너 행 — 광고 API 전까지 시안 에셋 */
export function ProductDetailAdBanners({
  className,
}: ProductDetailAdBannersProps) {
  return (
    <section
      aria-label="광고"
      className={cn(
        "grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5 md:gap-[30px]",
        className
      )}
    >
      {AD_BANNERS.map((banner) => (
        <div
          key={banner.alt}
          className="relative h-[200px] w-full overflow-hidden md:h-[280px]"
        >
          <Image
            src={banner.src}
            alt={banner.alt}
            fill
            unoptimized
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 230px"
          />
          <span
            className={cn(
              "absolute left-2.5 top-2.5 rounded-[20px] border px-1.5 py-0.5 font-sans text-[10px] font-semibold",
              banner.darkBadge
                ? "border-[#323232] text-[#323232]"
                : "border-white text-white"
            )}
          >
            AD
          </span>
        </div>
      ))}
    </section>
  );
}
