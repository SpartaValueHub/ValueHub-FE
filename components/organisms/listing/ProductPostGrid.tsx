import type { ReactNode } from "react";
import Link from "next/link";

import { FeedPostCard } from "@/components/molecules/listing/FeedPostCard";
import { Empty } from "@/components/molecules/overlay/Empty";
import { PRODUCT_POSTS_PATH } from "@/constants/product-posts";
import { formatListedAt } from "@/lib/format-listed-at";
import { cn } from "@/lib/utils";
import type { TradeStatus, UiProductPostCard } from "@/types/product-posts/ui";

interface ProductPostGridProps {
  items: UiProductPostCard[];
  banner?: ReactNode;
  bannerAfter?: number;
  className?: string;
}

function toFeedStatus(status: TradeStatus): "reserved" | "sold" | undefined {
  if (status === "RESERVED") return "reserved";
  if (status === "SOLD_OUT") return "sold";
  return undefined;
}

function CardLink({ item }: { item: UiProductPostCard }) {
  return (
    <Link
      href={`${PRODUCT_POSTS_PATH}/${item.productPostUuid}`}
      className="min-w-0 w-full max-w-[175px] md:max-w-[230px]"
    >
      <FeedPostCard
        className="w-full gap-4 md:gap-4"
        imageClassName="h-[213px] md:h-[280px]"
        name={item.name}
        image={item.thumbnailUrl}
        price={item.price}
        timeAgo={formatListedAt(item.listedAt)}
        status={toFeedStatus(item.tradeStatus)}
      />
    </Link>
  );
}

/** 상품 목록 그리드 — FeedPostCard 재사용, 판매중 뱃지는 숨김 */
export function ProductPostGrid({
  items,
  banner,
  bannerAfter = 8,
  className,
}: ProductPostGridProps) {
  if (items.length === 0) {
    return (
      <Empty
        title="등록된 상품이 없습니다"
        description="다른 카테고리를 선택하거나 잠시 후 다시 확인해 주세요."
      />
    );
  }

  const head = banner ? items.slice(0, bannerAfter) : items;
  const tail = banner ? items.slice(bannerAfter) : [];

  return (
    <div className={cn("flex flex-col gap-3.5 md:gap-8", className)}>
      <div className="grid grid-cols-2 justify-items-center gap-x-1.5 gap-y-3.5 md:grid-cols-4 md:gap-x-[30px] md:gap-y-10">
        {head.map((item) => (
          <CardLink key={item.productPostUuid} item={item} />
        ))}
      </div>
      {banner ? banner : null}
      {tail.length > 0 ? (
        <div className="grid grid-cols-2 justify-items-center gap-x-1.5 gap-y-3.5 md:grid-cols-4 md:gap-x-[30px] md:gap-y-10">
          {tail.map((item) => (
            <CardLink key={item.productPostUuid} item={item} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
