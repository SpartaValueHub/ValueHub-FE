import Link from "next/link";

import { FeedPostCard } from "@/components/molecules/listing/FeedPostCard";
import { Empty } from "@/components/molecules/overlay/Empty";
import { PRODUCT_POSTS_PATH } from "@/constants/product-posts";
import { formatListedAt } from "@/lib/format-listed-at";
import { cn } from "@/lib/utils";
import type { TradeStatus, UiProductPostCard } from "@/types/product-posts/ui";

interface NearbyProductPostsProps {
  items: UiProductPostCard[];
  className?: string;
}

function toFeedStatus(status: TradeStatus): "reserved" | "sold" | undefined {
  if (status === "RESERVED") return "reserved";
  if (status === "SOLD_OUT") return "sold";
  return undefined;
}

/** Figma 동네 추천 상품 — FeedPostCard 5열 */
export function NearbyProductPosts({
  items,
  className,
}: NearbyProductPostsProps) {
  return (
    <section
      aria-label="동네 추천 상품"
      className={cn("flex w-full flex-col gap-[30px]", className)}
    >
      <h2 className="font-sans text-xl tracking-[-0.4px] text-white">
        동네 추천 상품
      </h2>

      {items.length === 0 ? (
        <Empty
          title="추천 상품이 없습니다"
          description="같은 카테고리의 다른 상품을 곧 만나볼 수 있어요."
        />
      ) : (
        <div className="grid grid-cols-2 gap-x-[30px] gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
          {items.map((item) => (
            <Link
              key={item.productPostUuid}
              href={`${PRODUCT_POSTS_PATH}/${item.productPostUuid}`}
              className="min-w-0"
            >
              <FeedPostCard
                className="w-full max-w-[230px]"
                imageClassName="h-[200px] md:h-[280px]"
                name={item.name}
                image={item.thumbnailUrl}
                price={item.price}
                timeAgo={formatListedAt(item.listedAt)}
                status={toFeedStatus(item.tradeStatus)}
              />
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
