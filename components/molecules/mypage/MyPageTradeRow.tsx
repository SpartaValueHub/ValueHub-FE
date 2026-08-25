import { Icon } from "@/components/atoms/icons";
import { StatusBadge } from "@/components/atoms/status-badge";
import { MyPageGhostButton } from "@/components/molecules/mypage/MyPageGhostButton";
import { MyPageStarRating } from "@/components/molecules/mypage/MyPageStarRating";
import { formatMyPagePrice } from "@/constants/mypage";
import { cn } from "@/lib/utils";
import type {
  UiMyPageTradeItem,
  UiTradeListKind,
  UiTradeStatus,
} from "@/types/mypage/ui";

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
}

function TradeReview({ item }: { item: UiMyPageTradeItem }) {
  if (item.review.kind === "locked") {
    return (
      <>
        <p className="w-full text-center font-sans text-xs leading-[1.4] tracking-[-0.24px] text-white lg:hidden">
          거래가 완료되지 않아 후기/평점을 보거나 작성할 수 없습니다.
        </p>
        <div className="hidden w-[210px] flex-col items-start gap-5 lg:flex">
          <p className="font-sans text-base font-light text-white">
            후기 및 평점
          </p>
          <p className="font-sans text-base leading-[1.4] tracking-[-0.32px] text-white">
            거래가 완료되지 않아 후기/평점을
            <br />
            보거나 작성할 수 없습니다.
          </p>
        </div>
      </>
    );
  }

  if (item.review.kind === "rated") {
    return (
      <>
        <div className="flex items-center gap-[13px] lg:hidden">
          <MyPageStarRating score={item.review.score} />
          <button
            type="button"
            className="flex items-center gap-1 border-b-[0.5px] border-[#d0d0d0] p-0.5"
          >
            <span className="font-sans text-[13px] text-[#ababab]">
              상세보기
            </span>
            <Icon name="chevron-right" size={12} className="invert" />
          </button>
        </div>
        <MyPageGhostButton className="w-full lg:hidden">
          후기/평점 작성
        </MyPageGhostButton>
        <div className="hidden w-[210px] flex-col items-start gap-2.5 lg:flex">
          <p className="font-sans text-base font-light text-white">
            후기 및 평점
          </p>
          <div className="flex flex-col items-center gap-0.5">
            <div className="flex h-[33px] items-center gap-[13px]">
              <MyPageStarRating score={item.review.score} />
              <button
                type="button"
                className="flex items-center gap-1 border-b-[0.5px] border-[#d0d0d0] p-0.5"
              >
                <span className="font-sans text-[13px] text-[#ababab]">
                  상세보기
                </span>
                <Icon name="chevron-right" size={12} className="invert" />
              </button>
            </div>
            <MyPageGhostButton className="w-full">
              후기/평점 작성
            </MyPageGhostButton>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <p className="w-full font-sans text-xs leading-[1.4] tracking-[-0.24px] text-white lg:hidden">
        아직 상대방이 후기와 평점을 작성하지 않았습니다.
      </p>
      <MyPageGhostButton className="w-full lg:hidden">
        작성한 후기 보기
      </MyPageGhostButton>
      <div className="hidden w-[210px] flex-col items-start gap-2.5 lg:flex">
        <p className="font-sans text-base font-light text-white">
          후기 및 평점
        </p>
        <div className="flex w-full flex-col items-start gap-0.5">
          <p className="font-sans text-base leading-[1.4] tracking-[-0.32px] text-white">
            아직 상대방이 후기와 평점을
            <br />
            작성하지 않았습니다.
          </p>
          <MyPageGhostButton className="w-[183px]">
            작성한 후기 보기
          </MyPageGhostButton>
        </div>
      </div>
    </>
  );
}

export function MyPageTradeRow({
  item,
  listKind = "sell",
  className,
}: MyPageTradeRowProps) {
  const badge = STATUS_BADGE[item.status];

  return (
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
            <p className="font-sans text-sm text-white lg:text-base">
              {item.title}
            </p>
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
          <MyPageGhostButton className="w-full lg:w-[150px]">
            {ACTION_LABEL[item.action]}
          </MyPageGhostButton>
        ) : null}
      </div>
      <TradeReview item={item} />
    </article>
  );
}
