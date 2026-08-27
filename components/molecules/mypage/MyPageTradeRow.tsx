"use client";

import Link from "next/link";

import { StatusBadge } from "@/components/atoms/status-badge";
import { MyPageGhostButton } from "@/components/molecules/mypage/MyPageGhostButton";
import { formatMyPagePrice } from "@/constants/mypage";
import { PRODUCT_POSTS_PATH } from "@/constants/product-posts";
import { useProductPostBump } from "@/hooks/product-posts/useProductPostBump";
import { useProductPostCompleteTrade } from "@/hooks/product-posts/useProductPostCompleteTrade";
import { cn } from "@/lib/utils";
import type {
  UiMyPageTradeItem,
  UiTradeListKind,
  UiTradeStatus,
} from "@/types/mypage/ui";
import type { UiProductPostDetail } from "@/types/product-posts/ui";

const STATUS_BADGE: Record<
  UiTradeStatus,
  { status: "selling" | "reserved" | "sold"; label: string }
> = {
  selling: { status: "selling", label: "판매중" },
  reserved: { status: "reserved", label: "예약중" },
  completed: { status: "sold", label: "거래완료" },
};

const ACTION_LABEL = {
  boost: "끌어올리기",
  complete: "거래 완료",
} as const;

interface MyPageTradeRowProps {
  item: UiMyPageTradeItem;
  listKind?: UiTradeListKind;
  className?: string;
  onBumpSuccess?: (detail: UiProductPostDetail) => void;
  onCompleteSuccess?: (detail: UiProductPostDetail) => void;
}

export function MyPageTradeRow({
  item,
  listKind = "sell",
  className,
  onBumpSuccess,
  onCompleteSuccess,
}: MyPageTradeRowProps) {
  const badge = STATUS_BADGE[item.status];
  const canBump = listKind === "sell" && item.action === "boost";
  const canComplete = listKind === "sell" && item.action === "complete";
  const detailHref = `${PRODUCT_POSTS_PATH}/${encodeURIComponent(item.id)}`;

  const {
    requestBump,
    bumping,
    dialogs: bumpDialogs,
  } = useProductPostBump({
    productPostUuid: item.id,
    onSuccess: onBumpSuccess,
  });

  const {
    requestComplete,
    completing,
    dialogs: completeDialogs,
  } = useProductPostCompleteTrade({
    productPostUuid: item.id,
    onSuccess: onCompleteSuccess,
  });

  const actionPending =
    (item.action === "boost" && bumping) ||
    (item.action === "complete" && completing);

  return (
    <>
      <article
        className={cn(
          "flex w-full flex-col gap-3.5 border-b border-[#ababab]/20 px-1 py-3.5 last:border-b-0 lg:flex-row lg:items-center lg:justify-between lg:border-0 lg:px-0 lg:py-0",
          className
        )}
      >
        <div className="flex flex-1 flex-col gap-3.5 lg:flex-row lg:items-center lg:gap-[30px]">
          <div className="flex w-full max-w-[500px] flex-col gap-1.5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col items-start gap-1.5">
              <StatusBadge
                status={badge.status}
                label={badge.label}
                className={cn(
                  item.status === "reserved" && "border-0 bg-[#f8e3b9]",
                  item.status === "completed" &&
                    cn(
                      "bg-[#868686] text-[#323232]",
                      listKind === "sell" && "lg:text-[#d0d0d0]"
                    )
                )}
              />
              <Link
                href={detailHref}
                className="font-sans text-sm text-white underline-offset-2 hover:underline lg:text-base"
              >
                {item.title}
              </Link>
              <p className="font-sans text-xs text-[#ababab] lg:text-sm">
                {item.location
                  ? `${item.date} ${item.location}에서 거래`
                  : item.date}
              </p>
            </div>
            <p className="shrink-0 font-sans text-white">
              <span className="text-xl font-medium lg:text-2xl">
                {formatMyPagePrice(item.price)}
              </span>
              <span className="text-base">원</span>
            </p>
          </div>
          {item.action ? (
            <MyPageGhostButton
              className="w-full lg:w-[150px]"
              disabled={
                item.action === "boost"
                  ? !canBump || bumping
                  : !canComplete || completing
              }
              onClick={() => {
                if (item.action === "boost") requestBump();
                if (item.action === "complete") requestComplete();
              }}
            >
              {actionPending
                ? item.action === "boost"
                  ? "끌어올리는 중…"
                  : "처리 중…"
                : ACTION_LABEL[item.action]}
            </MyPageGhostButton>
          ) : null}
        </div>
      </article>
      {canBump ? bumpDialogs : null}
      {canComplete ? completeDialogs : null}
    </>
  );
}
