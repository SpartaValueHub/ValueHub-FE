"use client";

import Image from "next/image";

import { Icon } from "@/components/atoms/icons";
import { Dialog, DialogContent } from "@/components/molecules/overlay/Dialog";
import { TrustGrade } from "@/components/molecules/listing/TrustGrade";
import { cn } from "@/lib/utils";
import type { UiUserProfile, UiUserProfileProduct } from "@/types/profile/ui";

interface UserProfileDialogProps {
  open: boolean;
  profile: UiUserProfile;
  onOpenChange?: (open: boolean) => void;
  onMoreClick?: () => void;
  onRatingDetailClick?: () => void;
  onProductsMoreClick?: () => void;
  className?: string;
}

function formatPrice(price: number) {
  return price.toLocaleString("ko-KR");
}

function StarIcon({ muted = false }: { muted?: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-block size-[26px] bg-[#EFBB55]",
        muted && "opacity-30"
      )}
      style={{
        maskImage: "url(/icons/system/essentials/star-fill.svg)",
        WebkitMaskImage: "url(/icons/system/essentials/star-fill.svg)",
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskPosition: "center",
      }}
    />
  );
}

function RatingStars({ score, max = 5 }: { score: number; max?: number }) {
  const fillPercent = Math.min(Math.max(score / max, 0), 1) * 100;

  return (
    <div className="relative h-[26px] w-[140px]" aria-hidden>
      <div className="flex h-full w-full items-center justify-between">
        {Array.from({ length: max }, (_, index) => (
          <StarIcon key={`empty-${index}`} muted />
        ))}
      </div>
      <div
        className="absolute inset-y-0 left-0 overflow-hidden"
        style={{ width: `${fillPercent}%` }}
      >
        <div className="flex h-full w-[140px] items-center justify-between">
          {Array.from({ length: max }, (_, index) => (
            <StarIcon key={`fill-${index}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ProfileProductCard({ product }: { product: UiUserProfileProduct }) {
  return (
    <article className="flex w-[124px] shrink-0 flex-col gap-2.5">
      <div className="relative h-[150px] w-[124px] overflow-hidden bg-[#d9d9d9]">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="124px"
          className="object-cover"
        />
      </div>
      <div className="flex flex-col gap-1.5 px-0.5">
        <p className="line-clamp-2 font-sans text-sm leading-normal text-[#323232]">
          {product.name}
        </p>
        <div className="flex flex-col gap-1">
          <p className="flex items-end gap-0.5 text-[#323232]">
            <span className="font-sans text-base font-medium leading-normal">
              {formatPrice(product.price)}
            </span>
            <span className="font-sans text-sm leading-normal">원</span>
          </p>
          <p className="flex gap-0.5 font-sans text-[11px] font-medium text-[#ababab]">
            <span>{product.priceKor}</span>
            <span>원</span>
          </p>
        </div>
        <p className="font-sans text-[11px] text-[#ababab]">
          {product.timeAgo}
        </p>
      </div>
    </article>
  );
}

function TextAction({
  label,
  onClick,
  className,
}: {
  label: string;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center gap-1 font-sans text-[#ababab]",
        className
      )}
    >
      {label}
      <Icon name="chevron-right" size={12} />
    </button>
  );
}

/** 유저 프로필 모달 — 목록·상세 등에서 동일하게 재사용 */
export function UserProfileDialog({
  open,
  profile,
  onOpenChange,
  onMoreClick,
  onRatingDetailClick,
  onProductsMoreClick,
  className,
}: UserProfileDialogProps) {
  function close() {
    onOpenChange?.(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} className="max-w-[620px]">
      <DialogContent
        padded={false}
        onClose={close}
        className={cn("px-[30px] pt-0 pb-[70px]", className)}
      >
        <div className="flex flex-col gap-2.5">
          <div className="flex items-start gap-5">
            <span className="relative size-[62px] shrink-0 overflow-hidden rounded-full bg-[rgba(221,221,221,0.87)]">
              {profile.avatarUrl ? (
                <Image
                  src={profile.avatarUrl}
                  alt=""
                  fill
                  sizes="62px"
                  className="object-cover"
                />
              ) : null}
            </span>
            <div className="flex items-start gap-2.5">
              <div className="flex flex-col justify-end gap-1.5">
                <p className="font-sans text-2xl leading-normal text-[#323232]">
                  {profile.nickname}
                </p>
                <p className="font-sans text-base leading-normal text-[#868686]">
                  {profile.joinedAtLabel}
                </p>
              </div>
              <button
                type="button"
                aria-label="더보기"
                onClick={onMoreClick}
                className="flex h-[43px] w-[30px] items-start justify-center text-[#323232]"
              >
                <Icon name="more" size={30} />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-[30px] pb-5">
            <div className="flex h-40 w-[150px] flex-col items-center justify-between">
              <p className="font-sans text-base text-[#323232]">거래안심등급</p>
              <TrustGrade level={profile.trustGrade} />
            </div>

            <div className="flex h-40 w-[150px] flex-col items-center justify-between">
              <p className="font-sans text-base text-[#323232]">활동 지역</p>
              <div className="flex w-full flex-col items-center gap-2.5">
                <p className="flex items-baseline justify-center gap-1.5 text-[#323232]">
                  <span className="font-sans text-lg leading-[1.4]">
                    {profile.city}
                  </span>
                  <span className="font-sans text-[30px] leading-normal">
                    {profile.neighborhood}
                  </span>
                </p>
                {profile.neighborhoodVerified ? (
                  <p className="flex items-center gap-1 font-sans text-sm text-[#ababab]">
                    동네 인증 완료
                    <Icon name="shield-check" size={20} />
                  </p>
                ) : null}
              </div>
            </div>

            <div className="flex h-40 w-[150px] flex-col items-center justify-between">
              <p className="font-sans text-base text-[#323232]">받은 별점</p>
              <div className="flex flex-col items-center gap-1.5">
                <p className="flex items-center gap-[3px]">
                  <span className="font-sans text-lg font-medium text-[#323232]">
                    {profile.rating.toFixed(1)}
                  </span>
                  <span className="font-sans text-sm font-medium leading-[1.3] text-[#868686]">
                    / 5.0
                  </span>
                </p>
                <RatingStars score={profile.rating} />
                <TextAction
                  label="상세보기"
                  onClick={onRatingDetailClick}
                  className="border-b-[0.5px] border-[#d0d0d0] pl-0.5 text-sm leading-[1.4]"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-5 py-2.5">
            <p className="font-sans text-base text-[#323232]">판매중인 물품</p>
            <TextAction
              label="더보기"
              onClick={onProductsMoreClick}
              className="text-[13px]"
            />
          </div>

          <div className="flex items-start justify-between">
            {profile.products.map((product) => (
              <ProfileProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
