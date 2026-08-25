import Image from "next/image";

import { Icon } from "@/components/atoms/icons";
import { StatusBadge } from "@/components/atoms/status-badge";
import { cn } from "@/lib/utils";

export type FeedDocumentTag = "warranty" | "receipt" | "appraisal";

const DOCUMENT_LABEL: Record<FeedDocumentTag, string> = {
  warranty: "보증서",
  receipt: "영수증",
  appraisal: "감정서",
};

interface FeedPostCardProps {
  name: string;
  image?: string | null;
  price: number;
  timeAgo: string;
  status?: "reserved" | "sold" | "selling";
  documents?: FeedDocumentTag[];
  favorited?: boolean;
  onFavoriteClick?: () => void;
  className?: string;
  /** 썸네일 영역 크기 — 목록 시안은 h-[280px] 등 */
  imageClassName?: string;
}

function formatPrice(price: number) {
  return price.toLocaleString("ko-KR");
}

/** Figma 상품 리스트 카드 — 기본 175×213, className·imageClassName으로 목록 시안 맞춤 */
export function FeedPostCard({
  name,
  image,
  price,
  timeAgo,
  status,
  documents = [],
  favorited = false,
  onFavoriteClick,
  className,
  imageClassName,
}: FeedPostCardProps) {
  return (
    <article className={cn("flex w-[175px] flex-col gap-4", className)}>
      <div
        className={cn(
          "relative flex h-[213px] w-full items-start justify-between overflow-hidden bg-[#3a3a3a] p-2.5",
          imageClassName
        )}
      >
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            unoptimized
            sizes="(max-width: 768px) 50vw, 230px"
            className="object-cover"
          />
        ) : null}
        {status ? (
          <StatusBadge status={status} className="relative z-10" />
        ) : (
          <span />
        )}
        {onFavoriteClick ? (
          <button
            type="button"
            aria-label={favorited ? "관심 해제" : "관심 등록"}
            aria-pressed={favorited}
            onClick={onFavoriteClick}
            className="relative z-10 flex size-[18px] items-center justify-center overflow-clip"
          >
            <Icon name="star" size={18} />
          </button>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5 px-1.5 md:gap-1.5">
        <p className="line-clamp-2 font-sans text-[13px] leading-normal text-white md:text-sm">
          {name}
        </p>
        <p className="flex items-end gap-0.5 text-white">
          <span className="font-sans text-base font-medium leading-none md:text-lg">
            {formatPrice(price)}
          </span>
          <span className="text-sm leading-none">원</span>
        </p>
        <p className="font-sans text-[10px] text-[#ababab] md:text-xs">
          {timeAgo}
        </p>
        {documents.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {documents.map((doc) => (
              <StatusBadge
                key={doc}
                status="document"
                label={DOCUMENT_LABEL[doc]}
              />
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}
