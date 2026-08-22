"use client";

import { useMemo, useState } from "react";

import { TrustGrade } from "@/components/molecules/listing/TrustGrade";
import { MyPageGhostButton } from "@/components/molecules/mypage/MyPageGhostButton";
import { MyPageTradeRow } from "@/components/molecules/mypage/MyPageTradeRow";
import { MyPageTradeStat } from "@/components/molecules/mypage/MyPageTradeStat";
import { cn } from "@/lib/utils";
import type {
  UiMyPageTradeItem,
  UiMyPageTradeSummary,
  UiTradeListKind,
  UiTradeStatus,
} from "@/types/mypage/ui";

type StatusFilter = "all" | UiTradeStatus;

const LIST_TABS: { id: UiTradeListKind; label: string }[] = [
  { id: "sell", label: "판매 목록" },
  { id: "buy", label: "구매 목록" },
];

const SELL_STATUS_FILTERS: { id: StatusFilter; label: string }[] = [
  { id: "all", label: "전체보기" },
  { id: "selling", label: "판매중" },
  { id: "reserved", label: "예약중" },
  { id: "completed", label: "거래완료" },
];

const BUY_STATUS_FILTERS: { id: StatusFilter; label: string }[] = [
  { id: "all", label: "전체보기" },
  { id: "reserved", label: "예약중" },
  { id: "completed", label: "거래완료" },
];

interface MyPageTradeSectionProps {
  summary: UiMyPageTradeSummary;
  sellItems: UiMyPageTradeItem[];
  buyItems: UiMyPageTradeItem[];
}

export function MyPageTradeSection({
  summary,
  sellItems,
  buyItems,
}: MyPageTradeSectionProps) {
  const [listKind, setListKind] = useState<UiTradeListKind>("sell");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const items = listKind === "sell" ? sellItems : buyItems;
  const statusFilters =
    listKind === "sell" ? SELL_STATUS_FILTERS : BUY_STATUS_FILTERS;
  const visibleItems = useMemo(
    () =>
      statusFilter === "all"
        ? items
        : items.filter((item) => item.status === statusFilter),
    [items, statusFilter]
  );

  return (
    <section
      id="trade"
      className="flex w-full scroll-mt-[120px] flex-col gap-5 lg:scroll-mt-[180px] lg:gap-[70px]"
    >
      <h2 className="font-sans text-base text-white lg:hidden">
        나의 거래 정보
      </h2>
      <div className="flex w-full flex-col gap-[30px] border border-[#868686] p-2.5 lg:gap-[50px] lg:border-[#d0d0d0] lg:py-[30px] lg:pr-5 lg:pl-[30px]">
        <h2 className="hidden font-sans text-xl text-white lg:block">
          나의 거래 정보
        </h2>
        <div className="flex items-center justify-between gap-3 lg:hidden">
          <p className="shrink-0 font-sans text-sm text-white">거래안심등급</p>
          <TrustGrade
            level={summary.trustGrade}
            iconWidth={31}
            iconHeight={42}
            className="gap-2.5 [&_p]:text-[13px] [&_p]:capitalize [&_p]:leading-normal [&_p]:text-white"
          />
          <p className="w-[163px] shrink-0 font-sans text-[10px] leading-normal text-[#868686]">
            {summary.nextGradeHint}
          </p>
        </div>
        <div className="hidden w-full flex-nowrap items-start justify-between lg:flex">
          <div className="flex h-40 min-w-0 flex-1 flex-col items-center justify-between whitespace-nowrap">
            <p className="font-sans text-base text-white">거래안심등급</p>
            <TrustGrade
              level={summary.trustGrade}
              className="gap-2.5 [&_p]:text-lg [&_p]:capitalize [&_p]:text-white"
            />
          </div>
          <MyPageTradeStat label="완료된 거래" value={summary.completedCount} />
          <MyPageTradeStat
            label="작성한 리뷰"
            value={summary.writtenReviewCount}
          />
          <MyPageTradeStat
            label="받은 리뷰"
            value={summary.receivedReviewCount}
          />
          <div className="flex h-40 min-w-0 flex-1 flex-col items-center gap-[50px] whitespace-nowrap text-[#f5f5f5]">
            <p className="font-sans text-base">활동 지역</p>
            <div className="flex flex-col items-start gap-1">
              <p className="font-sans text-xl">{summary.regionCity}</p>
              <p className="font-sans text-[30px] leading-none">
                {summary.regionDong}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-start justify-between lg:hidden">
          <MyPageTradeStat
            size="sm"
            label="완료된 거래"
            value={summary.completedCount}
          />
          <MyPageTradeStat
            size="sm"
            label="작성한 리뷰"
            value={summary.writtenReviewCount}
          />
          <MyPageTradeStat
            size="sm"
            label="받은 리뷰"
            value={summary.receivedReviewCount}
          />
          <div className="flex flex-col items-center gap-2.5 whitespace-nowrap text-[#f5f5f5]">
            <p className="font-sans text-sm">활동 지역</p>
            <div className="flex flex-col items-start gap-1">
              <p className="font-sans text-[13px]">{summary.regionCity}</p>
              <p className="font-sans text-base leading-none">
                {summary.regionDong}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
        <div className="flex h-[50px] w-full items-start justify-between">
          <p className="font-sans text-sm text-white lg:text-xl">
            현재 활동중인 지역
          </p>
          <div className="flex h-full w-[220px] items-end justify-between lg:w-[300px]">
            <p className="flex flex-col items-start gap-0.5 text-[#f5f5f5] lg:flex-row lg:items-end lg:gap-1.5">
              <span className="font-sans text-xs lg:pb-[3px] lg:text-xl">
                {summary.regionCity}
              </span>
              <span className="font-sans text-base leading-none lg:text-[30px]">
                {summary.regionDong}
              </span>
            </p>
            <MyPageGhostButton className="lg:w-[150px]">
              <span className="lg:hidden">동네 인증</span>
              <span className="hidden lg:inline">동네 인증하기</span>
            </MyPageGhostButton>
          </div>
        </div>
        <div className="flex h-[50px] w-full items-start justify-between">
          <p className="font-sans text-sm text-white lg:text-xl">
            활동지역 추가
          </p>
          <div className="flex h-full w-[220px] items-end justify-between gap-5 lg:w-[300px] lg:gap-2">
            <p className="min-w-0 flex-1 font-sans text-xs leading-normal text-white lg:w-[140px] lg:flex-none lg:text-base">
              최대 2개의 동네를 설정할 수 있습니다.
            </p>
            <MyPageGhostButton className="lg:w-[150px]">
              지역 추가
            </MyPageGhostButton>
          </div>
        </div>
      </div>

      <div className="flex w-full flex-col gap-[30px]">
        <div className="flex flex-col gap-2.5">
          <h2 className="font-sans text-base text-white lg:text-xl">
            거래 목록
          </h2>
          <div className="flex items-center gap-2.5 lg:gap-5">
            {LIST_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setListKind(tab.id);
                  setStatusFilter("all");
                }}
                className={cn(
                  "p-2.5 font-sans text-sm text-white lg:text-xl",
                  listKind === tab.id && "border-b-[1.5px] border-white"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        <div className="hidden items-end justify-between lg:flex">
          <div className="flex flex-wrap items-center gap-[18px]">
            {statusFilters.map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => setStatusFilter(filter.id)}
                className={cn(
                  "border border-white px-3 py-1.5 font-sans text-sm",
                  statusFilter === filter.id
                    ? "bg-white text-[#323232]"
                    : "bg-transparent text-white"
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <button type="button" className="font-sans text-sm text-white">
            더보기
          </button>
        </div>
        <div className="flex items-center gap-2.5 lg:hidden">
          {statusFilters.map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => setStatusFilter(filter.id)}
              className={cn(
                "border border-white px-2.5 py-1.5 font-sans text-xs",
                statusFilter === filter.id
                  ? "bg-white text-[#323232]"
                  : "bg-transparent text-white"
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <div className="flex w-full flex-col lg:gap-[30px]">
          {visibleItems.map((item) => (
            <MyPageTradeRow key={item.id} item={item} listKind={listKind} />
          ))}
        </div>
        <button
          type="button"
          className="mx-auto border-b-[0.5px] border-[#d0d0d0] px-1 py-0.5 font-sans text-xs text-white lg:hidden"
        >
          더보기
        </button>
      </div>
    </section>
  );
}
