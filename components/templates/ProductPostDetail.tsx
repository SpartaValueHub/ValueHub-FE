"use client";

import {
  MoreHorizontal,
  ChevronRight,
  ChevronDown,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";

import { ProductImageSlider } from "@/components/molecules/ProductImageSlider";
import { cn } from "@/lib/utils";
import type { UiProductPostDetail, TradeStatus, ConditionGrade } from "@/types/product-posts/ui";

interface ProductPostDetailProps {
  post: UiProductPostDetail;
  categoryPath: string;
}

const TRADE_STATUS_LABEL: Record<TradeStatus, string> = {
  SELLING: "판매중",
  RESERVED: "예약중",
  SOLD_OUT: "거래완료",
};

const TRADE_STATUS_STYLE: Record<TradeStatus, string> = {
  SELLING: "bg-vh-gold-300 text-vh-gray-900",
  RESERVED: "bg-vh-gold-300 text-vh-gray-900",
  SOLD_OUT: "bg-vh-gray-700 text-vh-gray-300",
};

const CONDITION_DESCRIPTIONS: Record<ConditionGrade, string> = {
  S: "미사용 또는 새상품 수준",
  A: "사용감 있지만 상태 양호",
  B: "사용감이 눈에 띄는 수준",
  C: "하자 있음 (설명 참고)",
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("ko-KR").format(price);
}

export function ProductPostDetail({ post, categoryPath }: ProductPostDetailProps) {
  const [descExpanded, setDescExpanded] = useState(false);

  const hasWarranty = post.documents.some((d) => d.type === "WARRANTY");
  const hasReceipt = post.documents.some((d) => d.type === "RECEIPT");
  const hasAppraisal = post.documents.some((d) => d.type === "APPRAISAL");

  return (
    <main className="mx-auto w-full max-w-[1240px] px-5 pb-0 pt-8 sm:px-8 md:pt-10">
      {/* ── 상단 2컬럼: 이미지 | 상품 정보 ── */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-10">
        {/* 좌측: 이미지 슬라이더 */}
        <ProductImageSlider images={post.images} productName={post.name} />

        {/* 우측: 상품 정보 — 점3개·박스·채팅하기가 같은 폭으로 정렬 */}
        <div className="flex w-fit max-w-full flex-col">
          <span className="font-sans text-sm text-vh-gray-500">
            {categoryPath}
          </span>

          <div className="mt-1.5 flex items-start justify-between gap-3">
            <h1 className="font-sans text-xl font-semibold text-vh-gray-100 md:text-2xl">
              {post.name}
            </h1>
            <button
              type="button"
              className="mt-0.5 shrink-0 text-vh-gray-300 transition-colors hover:text-vh-gray-100"
              aria-label="더보기"
            >
              <MoreHorizontal className="size-5" />
            </button>
          </div>

          <div className="mt-4 flex items-center gap-2.5">
            <span className="font-sans text-2xl font-bold text-vh-gray-100 md:text-[32px] md:leading-none">
              {formatPrice(post.price)}원
            </span>
            {post.tradeStatus !== "SELLING" && (
              <span
                className={cn(
                  "rounded-sm px-2 py-0.5 font-sans text-xs font-semibold",
                  TRADE_STATUS_STYLE[post.tradeStatus]
                )}
              >
                {TRADE_STATUS_LABEL[post.tradeStatus]}
              </span>
            )}
          </div>

          {post.placeName && (
            <div className="mt-3 flex items-center gap-2 font-sans text-sm">
              <span className="text-vh-gray-100">거래희망장소</span>
              <span className="font-medium text-vh-gray-100">{post.placeName}</span>
              <ChevronRight className="size-4 text-vh-gray-100" strokeWidth={1.5} />
            </div>
          )}

          <div className="mt-10 rounded-md border border-white/15 px-5 py-4">
            <div className="flex items-center gap-4">
              <span className="shrink-0 font-sans text-[13px] text-vh-gray-100">
                상품 상태
              </span>
              <span className="font-sans text-[28px] font-bold leading-none text-vh-gray-100">
                {post.conditionGrade}
              </span>
              <span className="font-sans text-[11px] text-vh-gray-500">
                {CONDITION_DESCRIPTIONS[post.conditionGrade]}
              </span>
            </div>

            <div className="mt-3 flex items-center gap-4">
              <span className="shrink-0 font-sans text-[13px] text-vh-gray-100">
                첨부 서류
              </span>
              <div className="flex items-center justify-start gap-3">
                <span
                  className={cn(
                    "font-sans text-[13px]",
                    hasReceipt ? "text-vh-gray-100" : "text-vh-gray-700"
                  )}
                >
                  영수증
                </span>
                <span
                  className={cn(
                    "font-sans text-[13px]",
                    hasWarranty ? "text-vh-gray-100" : "text-vh-gray-700"
                  )}
                >
                  보증서
                </span>
                <span
                  className={cn(
                    "font-sans text-[13px]",
                    hasAppraisal ? "text-vh-gray-100" : "text-vh-gray-700"
                  )}
                >
                  감정서
                </span>
                <span className="font-sans text-[13px] text-vh-gray-700">
                  기타 서류
                </span>
              </div>
            </div>

            <p className="mt-4 whitespace-pre-line font-sans text-[10px] leading-[1.7] text-vh-gray-500">
              {`등록된 보증서, 영수증, 감정서 등은 판매자가 제공한 자료입니다. 본 플랫폼은 해당 자료 및 상품의 정품 여부를
보증하거나 인증하지 않으며, 거래에 대한 최종 판단과 확인 책임은 구매자에게 있습니다. 구매 전 상품 상태와
인증 서류를 꼼꼼히 확인한 후 안전하게 거래하시기 바랍니다.`}
            </p>
          </div>

          <div className="mt-10 flex items-center">
            <div className="flex shrink-0 items-center gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#cfcfcf] font-sans text-[11px] text-vh-gray-900">
                프사
              </div>
              <div className="leading-tight">
                <div className="flex items-center gap-1.5">
                  <span className="font-sans text-[15px] font-semibold text-vh-gray-100">
                    초량동불주먹
                  </span>
                  <ChevronRight
                    className="size-4 shrink-0 text-vh-gray-100"
                    strokeWidth={1.5}
                  />
                </div>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="font-sans text-[12px] text-vh-gray-500">
                    동구 초량동
                  </span>
                  <ShieldCheck className="size-3.5 text-vh-gray-500" strokeWidth={1.5} />
                </div>
              </div>
            </div>

            <div className="flex flex-1 flex-col items-center justify-center">
              <ChevronDown className="size-5 text-[#c9b08a]" strokeWidth={1.5} />
              <span className="mt-0.5 font-sans text-[13px] text-vh-gray-300">
                거래안심등급
              </span>
            </div>

            <button
              type="button"
              className="flex h-11 w-[42%] shrink-0 items-center justify-center rounded-none bg-vh-gold-500 font-sans text-sm font-semibold text-vh-gray-900 transition-colors hover:bg-vh-gold-300"
            >
              채팅하기
            </button>
          </div>
        </div>
      </div>

      {/* ── 설명 영역 (전체 폭) ── */}
      <div className="mt-10 border-t border-vh-gray-700 pt-6">
        <div
          className={cn(
            "relative font-sans text-sm leading-relaxed text-vh-gray-300",
            !descExpanded && "max-h-[100px] overflow-hidden"
          )}
        >
          <p className="whitespace-pre-wrap">{post.description}</p>
          {!descExpanded && (
            <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-vh-surface-charcoal to-transparent" />
          )}
        </div>
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={() => setDescExpanded((prev) => !prev)}
            className="flex items-center gap-1 rounded-full border border-vh-gray-700 px-8 py-2 font-sans text-sm text-vh-gray-300 transition-colors hover:border-vh-gray-500"
          >
            {descExpanded ? "접기" : "더보기"}
            <ChevronDown
              className={cn("size-4 transition-transform", descExpanded && "rotate-180")}
              strokeWidth={1.5}
            />
          </button>
        </div>
      </div>
    </main>
  );
}
