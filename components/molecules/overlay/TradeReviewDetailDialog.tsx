"use client";

import Image from "next/image";

import { Button } from "@/components/atoms/button";
import { RatingStars } from "@/components/molecules/listing/RatingStars";
import { Dialog, DialogContent } from "@/components/molecules/overlay/Dialog";
import { cn } from "@/lib/utils";
import type { UiTradeReview, UiTradeReviewDetail } from "@/types/profile/ui";

interface TradeReviewDetailDialogProps {
  open: boolean;
  detail: UiTradeReviewDetail;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

function RatingScore({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <p className="flex items-center gap-px">
      <span className="font-sans text-lg font-medium text-[#323232]">
        {rating.toFixed(1)}
      </span>
      <span className="font-sans text-sm font-medium text-[#868686]">
        /{max.toFixed(1)}
      </span>
    </p>
  );
}

function DistributionRow({
  score,
  count,
  maxCount,
}: {
  score: number;
  count: number;
  maxCount: number;
}) {
  const percent = maxCount > 0 ? (count / maxCount) * 100 : 0;

  return (
    <div className="flex items-center gap-[18px]">
      <span className="w-[21px] shrink-0 text-center font-sans text-sm tracking-[-0.28px] text-black">
        {score}점
      </span>
      <div className="h-1 w-[214px] overflow-hidden rounded-[10px] bg-[#d9d9d9]">
        <div
          className="h-full rounded-[10px] bg-[#EFBB55]"
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="font-sans text-sm tracking-[-0.28px] text-black">
        {count}
      </span>
    </div>
  );
}

function ReviewItem({ review }: { review: UiTradeReview }) {
  return (
    <article className="flex w-full items-start gap-1.5">
      <span className="relative size-8 shrink-0 overflow-hidden rounded-full bg-[rgba(221,221,221,0.87)]">
        {review.avatarUrl ? (
          <Image
            src={review.avatarUrl}
            alt=""
            fill
            sizes="32px"
            className="object-cover"
          />
        ) : null}
      </span>
      <div className="flex min-w-0 flex-1 flex-col items-start gap-4">
        <div className="flex flex-col items-start gap-1">
          <p className="font-sans text-base font-medium text-[#323232]">
            {review.nickname}
          </p>
          <p className="flex items-center gap-2.5 font-sans text-sm text-[#868686]">
            <span>{review.roleLabel}</span>
            <span>{review.dateLabel}</span>
          </p>
        </div>
        <p className="font-sans text-base leading-normal text-[#323232]">
          {review.content}
        </p>
      </div>
    </article>
  );
}

/** 거래 후기 상세 모달 — 프로필 받은 별점 상세보기에서 재사용 */
export function TradeReviewDetailDialog({
  open,
  detail,
  onOpenChange,
  className,
}: TradeReviewDetailDialogProps) {
  const ratingMax = detail.ratingMax ?? 5;
  const maxCount = Math.max(...detail.distribution.map((row) => row.count), 1);
  const distribution = [...detail.distribution].sort(
    (a, b) => b.score - a.score
  );

  function close() {
    onOpenChange?.(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onClose={close}
        padded={false}
        className={cn(
          "flex flex-col items-center gap-[30px] pt-[50px]",
          className
        )}
      >
        <div className="flex w-full flex-col items-center gap-5 px-[70px]">
          <h2 className="font-sans text-lg leading-[1.5] text-[#323232]">
            거래 후기 상세
          </h2>
          <div className="flex items-center justify-center gap-5">
            <RatingStars score={detail.rating} max={ratingMax} />
            <RatingScore rating={detail.rating} max={ratingMax} />
          </div>
          <div className="flex flex-col items-start gap-1.5">
            {distribution.map((row) => (
              <DistributionRow
                key={row.score}
                score={row.score}
                count={row.count}
                maxCount={maxCount}
              />
            ))}
          </div>
        </div>

        <div className="flex w-full flex-col gap-5 px-5">
          <p className="font-sans text-lg leading-[1.5] text-black">
            후기 {detail.totalCount}개
          </p>
          <div className="flex max-h-[398px] flex-col gap-5 overflow-y-auto overscroll-contain pr-1">
            {detail.reviews.map((review) => (
              <ReviewItem key={review.id} review={review} />
            ))}
          </div>
        </div>

        <div className="flex w-full items-center justify-center px-[70px]">
          <Button
            type="button"
            variant="modal"
            size="modal"
            className="w-[194px]"
            onClick={close}
          >
            확인
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
