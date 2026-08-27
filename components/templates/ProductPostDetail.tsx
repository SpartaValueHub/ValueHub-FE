"use client";

import { useState } from "react";

import { Icon } from "@/components/atoms/icons";
import { StatusBadge } from "@/components/atoms/status-badge";
import { VhIcon } from "@/components/atoms/vh-icon";
import { KakaoMapPicker } from "@/components/molecules/maps/KakaoMapPicker";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/molecules/overlay/Dialog";
import {
  ProductChatCta,
  type ProductChatViewerRole,
} from "@/components/molecules/product-posts/ProductChatCta";
import { ProductOwnerOptionsMenu } from "@/components/molecules/product-posts/ProductOwnerOptionsMenu";
import { SellerProfileDialogHost } from "@/components/molecules/product-posts/SellerProfileDialogHost";
import {
  ProductImageSlider,
  type ProductSliderSlide,
} from "@/components/molecules/ProductImageSlider";
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
  sellerNickname?: string;
  sellerProfileImageUrl?: string | null;
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
  { type: "OTHER" as const, label: "기타 서류" },
];

/** 상품 이미지(sortOrder) 뒤에 영수증→보증서→감정서→기타 (유형별 전부) */
function buildDetailSliderSlides(
  post: UiProductPostDetail
): ProductSliderSlide[] {
  const productSlides: ProductSliderSlide[] = [...post.images]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((img) => ({
      id: img.uuid,
      url: img.url,
    }));

  const documentSlides: ProductSliderSlide[] = [];
  for (const { type, label } of DOC_TYPES) {
    for (const doc of post.documents.filter((d) => d.type === type)) {
      if (!doc.url.trim()) continue;
      documentSlides.push({
        id: doc.uuid,
        url: doc.url,
        label,
      });
    }
  }

  return [...productSlides, ...documentSlides];
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("ko-KR").format(price);
}

/** 판매중은 뱃지 없음 — 예약중·판매완료만 */
function tradeBadgeStatus(status: TradeStatus): "reserved" | "sold" | null {
  if (status === "RESERVED") return "reserved";
  if (status === "SOLD_OUT") return "sold";
  return null;
}

/** 판매자 활동 위치 — 멤버 주소 연동 전 Figma placeholder */
const SELLER_ACTIVITY_LOCATION = "동구 초량동";
const SELLER_FALLBACK_NICKNAME = "판매자";

function SellerProfile({
  memberUuid,
  nickname,
  profileImageUrl,
}: {
  memberUuid: string;
  nickname: string;
  profileImageUrl?: string | null;
}) {
  const [profileOpen, setProfileOpen] = useState(false);
  const displayName = nickname.trim() || SELLER_FALLBACK_NICKNAME;
  const avatarInitial = displayName.slice(0, 1);

  return (
    <div className="flex items-center gap-5">
      <button
        type="button"
        className="flex items-center gap-2.5"
        aria-label={`${displayName} 프로필`}
        onClick={() => setProfileOpen(true)}
      >
        {profileImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- 외부/기본 아바타 URL
          <img
            src={profileImageUrl}
            alt=""
            className="size-[37px] shrink-0 rounded-full object-cover md:size-12"
          />
        ) : (
          <span className="flex size-[37px] shrink-0 items-center justify-center rounded-full bg-[#dddddd]/87 font-sans text-[10px] text-[#323232] md:size-12 md:text-xs">
            {avatarInitial}
          </span>
        )}
        <span className="flex flex-col items-start gap-0.5 md:gap-2.5">
          <span className="flex items-center gap-1.5">
            <span className="font-sans text-base font-medium text-white md:text-2xl md:font-normal">
              {displayName}
            </span>
            <Icon name="chevron-right" size={20} className="md:hidden" />
            <Icon
              name="chevron-right"
              size={26}
              className="hidden md:inline-flex"
            />
          </span>
          <span className="flex items-center gap-1">
            <span className="font-sans text-[10px] tracking-[-0.5px] text-[#ababab] md:text-[13px] md:tracking-[-0.65px]">
              {SELLER_ACTIVITY_LOCATION}
            </span>
            <Icon name="shield-check" size={16} className="text-[#ababab]" />
          </span>
        </span>
      </button>

      <div className="flex flex-col items-center gap-1.5 md:gap-5">
        <VhIcon
          src="/product-detail/trust-grade-chevron.svg"
          width={21}
          height={28}
          alt=""
        />
        <span className="font-sans text-[10px] tracking-[-0.5px] text-[#ababab] md:text-[13px] md:tracking-[-0.65px]">
          거래안심등급
        </span>
      </div>
      <SellerProfileDialogHost
        open={profileOpen}
        memberUuid={memberUuid}
        previewNickname={nickname}
        previewAvatarUrl={profileImageUrl}
        onOpenChange={setProfileOpen}
      />
    </div>
  );
}

/** Figma product_detail (PC + 모바일) */
export function ProductPostDetail({
  post,
  categoryPath,
  chatRole,
  activeChatCount = 0,
  sellerNickname = "",
  sellerProfileImageUrl = null,
}: ProductPostDetailProps) {
  const [descExpanded, setDescExpanded] = useState(false);
  const [tradeMapOpen, setTradeMapOpen] = useState(false);
  const attached = new Set(post.documents.map((d) => d.type));
  const badge = tradeBadgeStatus(post.tradeStatus);
  const displayNickname = sellerNickname.trim() || SELLER_FALLBACK_NICKNAME;
  const sliderSlides = buildDetailSliderSlides(post);
  const hasTradeCoords =
    post.latitude != null &&
    post.longitude != null &&
    Number.isFinite(post.latitude) &&
    Number.isFinite(post.longitude);
  const tradePlaceLabel = post.placeName?.trim() || "거래희망장소";

  return (
    <>
      <div className="flex w-full flex-col gap-[30px] md:gap-[50px]">
        <div className="flex flex-col items-start gap-[30px] md:gap-[50px] lg:flex-row">
          <ProductImageSlider
            slides={sliderSlides}
            productName={post.name}
            className="mx-auto w-full shrink-0 max-w-none md:max-w-[600px] lg:mx-0"
          />

          <div className="flex w-full min-w-0 flex-1 flex-col gap-2.5 px-4 md:gap-[50px] md:px-0 md:py-[30px]">
            <div className="flex flex-col gap-2.5 md:gap-5">
              <div className="flex flex-col gap-1 md:gap-1.5">
                <p className="font-sans text-[10px] tracking-[-0.5px] text-[#ababab] md:text-base md:tracking-[-0.8px]">
                  {categoryPath}
                </p>
                <div className="flex items-center justify-between gap-3">
                  <h1 className="font-sans text-xl font-medium tracking-[-1px] text-white md:text-[30px] md:leading-[1.5] md:tracking-[-1.5px]">
                    {post.name}
                  </h1>
                  {chatRole === "owner" ? (
                    <ProductOwnerOptionsMenu
                      productPostUuid={post.productPostUuid}
                      canEdit={post.tradeStatus === "SELLING"}
                    />
                  ) : null}
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <div className="flex items-center gap-4">
                  <p className="font-sans text-2xl font-bold leading-[0.9] tracking-[0.96px] text-white md:text-[30px] md:tracking-[1.2px]">
                    {formatPrice(post.price)}
                    <span className="ml-1 text-base font-medium tracking-[-0.48px] md:text-xl md:tracking-[-0.6px]">
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
                    <span className="shrink-0 font-sans text-xs tracking-[-0.6px] text-white md:text-base md:tracking-[-0.8px]">
                      거래희망장소
                    </span>
                    <button
                      type="button"
                      disabled={!hasTradeCoords}
                      aria-label={`${tradePlaceLabel} 지도 보기`}
                      onClick={() => {
                        if (hasTradeCoords) setTradeMapOpen(true);
                      }}
                      className="flex items-center gap-0.5 font-sans text-sm tracking-[-0.7px] text-white disabled:opacity-50 md:gap-1.5 md:text-lg md:tracking-[-0.9px]"
                    >
                      {post.placeName}
                      <Icon
                        name="chevron-right"
                        size={20}
                        className="md:hidden"
                      />
                      <Icon
                        name="chevron-right"
                        size={26}
                        className="hidden md:inline-flex"
                      />
                    </button>
                  </div>
                ) : null}
              </div>
            </div>

            {/* 모바일: 판매자 → 상태박스 / PC: 상태박스 → 판매자+채팅 */}
            <div className="mt-2.5 md:mt-0 md:contents">
              <div className="md:hidden">
                <SellerProfile
                  memberUuid={post.memberUuid}
                  nickname={displayNickname}
                  profileImageUrl={sellerProfileImageUrl}
                />
              </div>

              <div className="mt-2.5 flex w-full flex-col gap-5 border border-[#808080] p-2.5 md:mt-0 md:px-4 md:py-2.5">
                <div className="flex flex-col gap-2.5">
                  <div className="flex flex-wrap items-center gap-x-[30px] gap-y-2">
                    <span className="font-sans text-[13px] tracking-[0.26px] text-white md:text-base md:tracking-[0.32px]">
                      상품 상태
                    </span>
                    <div className="flex items-center gap-[30px]">
                      <span className="font-sans text-xl tracking-[0.4px] text-white md:text-[30px] md:tracking-[0.6px]">
                        {post.conditionGrade}
                      </span>
                      <span className="font-sans text-xs tracking-[0.24px] text-[#ababab] md:text-sm md:tracking-[0.28px]">
                        {CONDITION_DESCRIPTIONS[post.conditionGrade]}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-[30px] gap-y-2">
                    <span className="font-sans text-[13px] tracking-[0.26px] text-white md:text-base md:tracking-[0.32px]">
                      첨부 서류
                    </span>
                    <div className="flex flex-wrap items-start gap-5 font-sans text-sm tracking-[0.28px] text-white md:gap-[30px] md:text-xl md:tracking-[0.4px]">
                      {DOC_TYPES.map((doc) => (
                        <span
                          key={doc.type}
                          className={cn(
                            !attached.has(doc.type) && "opacity-30"
                          )}
                        >
                          {doc.label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <p className="font-sans text-xs leading-[1.4] text-[#ababab] md:text-sm">
                  등록된 보증서, 영수증, 감정서 등은 판매자가 제공한 자료입니다.
                  본 플랫폼은 해당 자료 및 상품의 정품 여부를 보증하거나
                  인증하지 않으며, 거래에 대한 최종 판단과 확인 책임은
                  구매자에게 있습니다. 구매 전 상품 상태와 인증 서류를 꼼꼼히
                  확인한 후 안전하게 거래하시기 바랍니다.
                </p>
              </div>

              <div className="mt-2.5 hidden items-center gap-[30px] md:mt-0 md:flex">
                <SellerProfile
                  memberUuid={post.memberUuid}
                  nickname={displayNickname}
                  profileImageUrl={sellerProfileImageUrl}
                />
                <ProductChatCta
                  role={chatRole}
                  productPostUuid={post.productPostUuid}
                  sellerMemberUuid={post.memberUuid}
                  sellerNickname={sellerNickname}
                  activeChatCount={activeChatCount}
                  className="max-w-none"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="relative px-4 md:px-0">
          <div
            className={cn(
              "font-sans text-sm leading-[1.55] tracking-[-0.7px] text-white whitespace-pre-wrap md:text-lg md:tracking-[-0.9px]",
              !descExpanded && "max-h-[100px] overflow-hidden md:max-h-[130px]"
            )}
          >
            {post.description}
          </div>
          {!descExpanded ? (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[100px] bg-gradient-to-t from-[#323232] from-[30%] to-transparent md:h-[130px]" />
          ) : null}
          <div className="relative z-10 mt-2 flex justify-center md:mt-5">
            <button
              type="button"
              onClick={() => setDescExpanded((v) => !v)}
              className="flex w-full max-w-[300px] items-center justify-center gap-1 border border-[#868686] bg-[#323232] py-2 font-sans text-sm font-medium tracking-[-0.42px] text-[#d0d0d0] md:max-w-[380px] md:gap-2.5 md:py-3.5 md:text-base md:tracking-[-0.48px]"
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

      <Dialog open={tradeMapOpen} onOpenChange={setTradeMapOpen}>
        <DialogContent
          onClose={() => setTradeMapOpen(false)}
          className="px-[50px] pb-8"
        >
          <DialogTitle className="w-full px-0 text-xl leading-[1.5] sm:px-0">
            {tradePlaceLabel}
          </DialogTitle>
          {hasTradeCoords ? (
            <KakaoMapPicker
              interactive={false}
              initialLatitude={post.latitude}
              initialLongitude={post.longitude}
              className="size-full max-h-[400px] min-h-[240px] sm:size-[400px]"
            />
          ) : null}
          <p className="flex w-full items-center gap-1.5 font-sans text-base text-[#323232]">
            <Icon name="location" size={20} />
            {tradePlaceLabel}
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}
