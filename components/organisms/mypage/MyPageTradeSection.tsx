"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { verifySelectedRegionAction } from "@/actions/member-regions";
import { TrustGrade } from "@/components/molecules/listing/TrustGrade";
import { MyPageGhostButton } from "@/components/molecules/mypage/MyPageGhostButton";
import { MyPageTradeRow } from "@/components/molecules/mypage/MyPageTradeRow";
import { MyPageTradeStat } from "@/components/molecules/mypage/MyPageTradeStat";
import { RegionVerifyDialog } from "@/components/molecules/mypage/RegionVerifyDialog";
import { AlertDialog } from "@/components/molecules/overlay/AlertDialog";
import { DialogDescription } from "@/components/molecules/overlay/Dialog";
import { notifyIfSessionExpiredAction } from "@/lib/auth/session-expired.client";
import { splitRegionName } from "@/lib/member-regions/region-name";
import { cn } from "@/lib/utils";
import type { UiMemberRegion } from "@/types/member-regions/ui";
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
  memberRegions: UiMemberRegion[];
  sellItems: UiMyPageTradeItem[];
  buyItems: UiMyPageTradeItem[];
}

export function MyPageTradeSection({
  summary,
  memberRegions,
  sellItems,
  buyItems,
}: MyPageTradeSectionProps) {
  const router = useRouter();
  const [listKind, setListKind] = useState<UiTradeListKind>("sell");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [verifySlot, setVerifySlot] = useState<"primary" | "secondary">(
    "primary"
  );
  const [verifying, setVerifying] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackTitle, setFeedbackTitle] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const primaryRegion =
    memberRegions.find((r) => r.primary) ?? memberRegions[0] ?? null;
  const secondaryRegion =
    memberRegions.find(
      (r) => !r.primary && r.memberRegionId !== primaryRegion?.memberRegionId
    ) ??
    memberRegions.find(
      (r) => r.memberRegionId !== primaryRegion?.memberRegionId
    ) ??
    null;

  const primaryParts = primaryRegion
    ? splitRegionName(primaryRegion.regionName)
    : { regionCity: summary.regionCity, regionDong: summary.regionDong };
  const secondaryParts = secondaryRegion
    ? splitRegionName(secondaryRegion.regionName)
    : null;

  const isPrimaryVerified = primaryRegion?.verified === true;
  const canAddSecondary = memberRegions.length < 2;
  const activityHint =
    primaryParts.regionDong.trim() || primaryParts.regionCity.trim();

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

  const showFeedback = (title: string, message: string) => {
    setFeedbackTitle(title);
    setFeedbackMessage(message);
    setFeedbackOpen(true);
  };

  const openVerify = (slot: "primary" | "secondary") => {
    if (verifying) return;
    if (slot === "secondary" && !secondaryRegion && !canAddSecondary) {
      showFeedback("추가 불가", "동네는 최대 2개까지 등록할 수 있습니다.");
      return;
    }
    setVerifySlot(slot);
    setVerifyOpen(true);
  };

  const onConfirmVerify = (payload: {
    regionCode: number;
    latitude: number;
    longitude: number;
    slot: "primary" | "secondary";
  }) => {
    if (verifying) return;
    setVerifying(true);
    void (async () => {
      try {
        const res = await verifySelectedRegionAction(
          payload.regionCode,
          payload.latitude,
          payload.longitude,
          payload.slot
        );
        if (!res.ok) {
          notifyIfSessionExpiredAction(res);
          setVerifyOpen(false);
          showFeedback(
            "인증 실패",
            res.code === "REGION_VERIFICATION_FAILED"
              ? "선택한 동네 근처에서만 인증할 수 있습니다. 위치를 확인해 주세요."
              : res.message
          );
          return;
        }
        setVerifyOpen(false);
        showFeedback(
          "동네 인증 완료",
          `${res.data.regionName} 인증이 완료되었습니다.`
        );
        router.refresh();
      } catch {
        setVerifyOpen(false);
        showFeedback(
          "인증 실패",
          "동네 인증 중 오류가 발생했습니다. 다시 시도해 주세요."
        );
      } finally {
        setVerifying(false);
      }
    })();
  };

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
              <p className="font-sans text-xl">{primaryParts.regionCity}</p>
              <p className="font-sans text-[30px] leading-none">
                {primaryParts.regionDong}
              </p>
              {primaryParts.regionDong || primaryParts.regionCity ? (
                <p className="font-sans text-xs text-[#ababab]">
                  {isPrimaryVerified ? "동네 인증 완료" : "미인증"}
                </p>
              ) : null}
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
              <p className="font-sans text-[13px]">{primaryParts.regionCity}</p>
              <p className="font-sans text-base leading-none">
                {primaryParts.regionDong}
              </p>
              {primaryParts.regionDong || primaryParts.regionCity ? (
                <p className="font-sans text-[10px] text-[#ababab]">
                  {isPrimaryVerified ? "동네 인증 완료" : "미인증"}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Figma 263:678 — 현재 활동중인 지역 + 추가된 활동지역 */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
        <div className="flex h-[50px] w-full items-start justify-between">
          <p className="font-sans text-sm text-white lg:text-xl">
            현재 활동중인 지역
          </p>
          <div className="flex h-full w-[220px] items-end justify-between gap-[30px] lg:w-auto lg:justify-end">
            <p className="flex flex-col items-start gap-0.5 text-[#f5f5f5] lg:flex-row lg:items-end lg:gap-1.5">
              <span className="font-sans text-xs lg:pb-[3px] lg:text-xl">
                {primaryParts.regionCity}
              </span>
              <span className="font-sans text-base leading-none lg:text-[30px]">
                {primaryParts.regionDong}
              </span>
            </p>
            <MyPageGhostButton
              className="shrink-0 lg:w-[150px]"
              disabled={verifying}
              onClick={() => openVerify("primary")}
            >
              {verifying && verifySlot === "primary"
                ? "인증 중…"
                : "동네 인증하기"}
            </MyPageGhostButton>
          </div>
        </div>

        {secondaryParts ? (
          <div className="flex h-[50px] w-full items-start justify-between">
            <p className="font-sans text-sm text-white lg:text-xl">
              추가된 활동지역
            </p>
            <div className="flex h-full w-[220px] items-end justify-between gap-[30px] lg:w-auto lg:justify-end">
              <p className="flex flex-col items-start gap-0.5 text-[#f5f5f5] lg:flex-row lg:items-end lg:gap-1.5">
                <span className="font-sans text-xs lg:pb-[3px] lg:text-xl">
                  {secondaryParts.regionCity}
                </span>
                <span className="font-sans text-base leading-none lg:text-[30px]">
                  {secondaryParts.regionDong}
                </span>
              </p>
              <MyPageGhostButton
                className="shrink-0 lg:w-[150px]"
                disabled={verifying}
                onClick={() => openVerify("secondary")}
              >
                {verifying && verifySlot === "secondary"
                  ? "인증 중…"
                  : "동네 인증하기"}
              </MyPageGhostButton>
            </div>
          </div>
        ) : (
          <div className="flex h-[50px] w-full items-start justify-between">
            <p className="font-sans text-sm text-white lg:text-xl">
              활동지역 추가
            </p>
            <div className="flex h-full w-[220px] items-end justify-between gap-5 lg:w-[300px] lg:gap-2">
              <p className="min-w-0 flex-1 font-sans text-xs leading-normal text-white lg:w-[140px] lg:flex-none lg:text-base">
                최대 2개의 동네를 설정할 수 있습니다.
                {memberRegions.length > 0
                  ? ` (현재 ${memberRegions.length}/2)`
                  : null}
              </p>
              <MyPageGhostButton
                className="shrink-0 lg:w-[150px]"
                disabled={!canAddSecondary || verifying}
                onClick={() => openVerify("secondary")}
              >
                지역 추가
              </MyPageGhostButton>
            </div>
          </div>
        )}
      </div>

      {!isPrimaryVerified ? (
        <p className="font-sans text-sm text-[#ababab]">
          「동네 인증하기」에서 동을 고른 뒤 GPS로 인증하세요. 인증 완료 후에도
          같은 버튼으로 동네를 바꿀 수 있습니다. 두 번째 동네는 「지역 추가」로
          동일하게 인증합니다.
        </p>
      ) : null}

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

      <RegionVerifyDialog
        open={verifyOpen}
        onOpenChange={setVerifyOpen}
        initialKeyword={
          verifySlot === "secondary"
            ? secondaryParts?.regionDong || ""
            : activityHint
        }
        slot={verifySlot}
        submitting={verifying}
        onConfirm={onConfirmVerify}
      />

      <AlertDialog
        open={feedbackOpen}
        onOpenChange={setFeedbackOpen}
        title={feedbackTitle}
        primaryLabel="확인"
        onPrimary={() => setFeedbackOpen(false)}
      >
        <DialogDescription className="whitespace-pre-wrap text-left text-base leading-[1.5] text-[#323232]">
          {feedbackMessage}
        </DialogDescription>
      </AlertDialog>
    </section>
  );
}
