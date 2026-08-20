"use client";

import { useState } from "react";

import { Icon } from "@/components/atoms/icons";
import { VhIcon } from "@/components/atoms/vh-icon";
import { StatusBadge } from "@/components/atoms/status-badge";
import {
  ProductChatCta,
  type ProductChatViewerRole,
} from "@/components/molecules/product-posts/ProductChatCta";
import { ProductImageSlider } from "@/components/molecules/ProductImageSlider";
import { cn } from "@/lib/utils";
import type {
  ConditionGrade,
  TradeStatus,
  UiProductPostDetail,
} from "@/types/product-posts/ui";

interface ProductPostDetailProps {
  post: UiProductPostDetail;
  categoryPath: string;
  chatRole: ProductChatViewerRole;
  activeChatCount?: number;
}

const CONDITION_DESCRIPTIONS: Record<ConditionGrade, string> = {
  S: "미사용 또는 새상품 수준",
  A: "사용감 있지만 상태 양호",
  B: "사용감이 눈에 띄는 수준",
  C: "하자 있음 (설명 참고)",
};

const DOC_TYPES = [
  { type: "RECEIPT" as const, label: "영수증" },
  { type: "WARRANTY" as const, label: "보증서" },
  { type: "APPRAISAL" as const, label: "감정서" },
];

function formatPrice(price: number) {
  return new Intl.NumberFormat("ko-KR").format(price);
}

/** 판매중은 뱃지 없음 — 예약중·판매완료만 */
function tradeBadgeStatus(status: TradeStatus): "reserved" | "sold" | null {
  if (status === "RESERVED") return "reserved";
  if (status === "SOLD_OUT") return "sold";
  return null;
}

/** 판매자 활동 위치 — 멤버 API 연동 전 Figma placeholder */
const SELLER_ACTIVITY_LOCATION = "동구 초량동";

/** Figma product_detail 상단·설명 — API 필드만 표시, 판매자/채팅은 UI 자리 */
export function ProductPostDetail({
  post,
  categoryPath,
  chatRole,
  activeChatCount = 0,
}: ProductPostDetailProps) {
  const [descExpanded, setDescExpanded] = useState(false);
  const attached = new Set(post.documents.map((d) => d.type));
  const badge = tradeBadgeStatus(post.tradeStatus);

  return (
    <div className="flex w-full flex-col gap-[50px]">
      <div className="flex flex-col items-start gap-[50px] lg:flex-row">
        <ProductImageSlider
          images={post.images}
          productName={post.name}
          className="mx-auto w-full shrink-0 lg:mx-0"
        />

        <div className="flex w-full min-w-0 flex-1 flex-col gap-[50px] py-0 md:py-[30px]">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <p className="font-sans text-base tracking-[-0.8px] text-[#ababab]">
                {categoryPath}
              </p>
              <div className="flex items-center justify-between gap-4">
                <h1 className="font-sans text-2xl font-medium tracking-[-1.5px] text-white md:text-[30px] md:leading-[1.5]">
                  {post.name}
                </h1>
                <button
                  type="button"
                  aria-label="더보기"
                  className="shrink-0 text-white"
                >
                  <Icon name="more" size={30} />
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-4">
                <p className="font-sans text-[30px] font-bold leading-[0.9] tracking-[1.2px] text-white">
                  {formatPrice(post.price)}
                  <span className="ml-1 text-xl font-medium tracking-[-0.6px]">
                    원
                  </span>
                </p>
                {badge ? (
                  <StatusBadge
                    status={badge}
                    className={
                      badge === "reserved"
                        ? "bg-[#f8e3b9] text-[#323232]"
                        : undefined
                    }
                  />
                ) : null}
              </div>

              {post.placeName ? (
                <div className="flex items-center gap-5">
                  <span className="shrink-0 font-sans text-base tracking-[-0.8px] text-white">
                    거래희망장소
                  </span>
                  <button
                    type="button"
                    className="flex items-start gap-1.5 font-sans text-lg tracking-[-0.9px] text-white"
                  >
                    {post.placeName}
                    <Icon name="chevron-right" size={26} />
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex w-full flex-col gap-5 border border-[#808080] px-4 py-2.5">
            <div className="flex flex-col gap-2.5">
              <div className="flex flex-wrap items-center gap-x-[30px] gap-y-2">
                <span className="font-sans text-base tracking-[0.32px] text-white">
                  상품 상태
                </span>
                <div className="flex items-center gap-[30px]">
                  <span className="font-sans text-[30px] tracking-[0.6px] text-white">
                    {post.conditionGrade}
                  </span>
                  <span className="font-sans text-sm tracking-[0.28px] text-[#ababab]">
                    {CONDITION_DESCRIPTIONS[post.conditionGrade]}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-x-[30px] gap-y-2">
                <span className="font-sans text-base tracking-[0.32px] text-white">
                  첨부 서류
                </span>
                <div className="flex flex-wrap items-start gap-[30px] font-sans text-xl tracking-[0.4px] text-white">
                  {DOC_TYPES.map((doc) => (
                    <span
                      key={doc.type}
                      className={cn(!attached.has(doc.type) && "opacity-30")}
                    >
                      {doc.label}
                    </span>
                  ))}
                  <span className="opacity-30">기타 서류</span>
                </div>
              </div>
            </div>

            <p className="font-sans text-sm leading-[1.4] text-[#ababab]">
              등록된 보증서, 영수증, 감정서 등은 판매자가 제공한 자료입니다. 본
              플랫폼은 해당 자료 및 상품의 정품 여부를 보증하거나 인증하지
              않으며, 거래에 대한 최종 판단과 확인 책임은 구매자에게 있습니다.
              구매 전 상품 상태와 인증 서류를 꼼꼼히 확인한 후 안전하게
              거래하시기 바랍니다.
            </p>
          </div>

          <div className="flex flex-col items-stretch gap-5 sm:flex-row sm:items-center sm:gap-[30px]">
            <div className="flex items-center gap-5">
              <button
                type="button"
                className="flex items-center gap-2.5"
                aria-label="판매자 프로필"
              >
                <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#dddddd]/87 font-sans text-xs text-[#323232]">
                  판매
                </span>
                <span className="flex flex-col items-start gap-2.5">
                  <span className="flex items-center gap-1.5">
                    <span className="font-sans text-2xl text-white">판매자</span>
                    <Icon name="chevron-right" size={26} />
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="font-sans text-[13px] tracking-[-0.65px] text-[#ababab]">
                      {SELLER_ACTIVITY_LOCATION}
                    </span>
                    <Icon
                      name="shield-check"
                      size={16}
                      className="text-[#ababab]"
                    />
                  </span>
                </span>
              </button>

              <div className="hidden flex-col items-center gap-5 sm:flex">
                <VhIcon
                  src="/product-detail/trust-grade-chevron.svg"
                  width={21}
                  height={28}
                  alt=""
                />
                <span className="font-sans text-[13px] tracking-[-0.65px] text-[#ababab]">
                  거래안심등급
                </span>
              </div>
            </div>

            <ProductChatCta
              role={chatRole}
              productPostUuid={post.productPostUuid}
              sellerMemberUuid={post.memberUuid}
              activeChatCount={activeChatCount}
            />
          </div>
        </div>
      </div>

      <div className="relative">
        <div
          className={cn(
            "font-sans text-lg leading-[1.55] tracking-[-0.9px] text-white whitespace-pre-wrap",
            !descExpanded && "max-h-[130px] overflow-hidden"
          )}
        >
          {post.description}
        </div>
        {!descExpanded ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[130px] bg-gradient-to-t from-[#323232] from-[30%] to-transparent" />
        ) : null}
        <div className="relative z-10 mt-5 flex justify-center">
          <button
            type="button"
            onClick={() => setDescExpanded((v) => !v)}
            className="flex w-full max-w-[380px] items-center justify-center gap-2.5 border border-[#868686] bg-[#323232] py-3.5 font-sans text-base font-medium tracking-[-0.48px] text-[#d0d0d0]"
          >
            {descExpanded ? "접기" : "더보기"}
            <Icon
              name="chevron-down"
              size={16}
              className={cn(
                "transition-transform",
                descExpanded && "rotate-180"
              )}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
