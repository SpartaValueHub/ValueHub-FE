"use client";

import { useEffect, useState, useTransition } from "react";

import { UserProfileDialog } from "@/components/molecules/overlay/UserProfileDialog";
import { USER_PROFILE_DEMO } from "@/constants/user-profile";
import {
  getUserProfileAction,
  listUserProfileProductsAction,
} from "@/actions/user-profile";
import type {
  UiProfileFieldSource,
  UiUserProfile,
  UiUserProfileLoadResult,
  UiUserProfileProduct,
} from "@/types/profile/ui";

function SourceBadge({
  label,
  source,
}: {
  label: string;
  source: UiProfileFieldSource;
}) {
  const isApi = source === "api";
  return (
    <span
      className={
        isApi
          ? "rounded px-1.5 py-0.5 font-sans text-[10px] font-medium tracking-tight text-white bg-emerald-600"
          : "rounded px-1.5 py-0.5 font-sans text-[10px] font-medium tracking-tight text-white bg-[#868686]"
      }
    >
      {label}:{isApi ? "API" : "목업"}
    </span>
  );
}

interface SellerProfileDialogHostProps {
  open: boolean;
  memberUuid: string;
  /** 상세에서 이미 조회한 값 — 로딩 전 표시용 */
  previewNickname?: string;
  previewAvatarUrl?: string | null;
  onOpenChange: (open: boolean) => void;
}

/** 상품 상세 판매자 → 프로필 모달 (공개 프로필 + 가입일 + 판매목록) */
export function SellerProfileDialogHost({
  open,
  memberUuid,
  previewNickname = "",
  previewAvatarUrl = null,
  onOpenChange,
}: SellerProfileDialogHostProps) {
  const [pending, startTransition] = useTransition();
  const [morePending, startMoreTransition] = useTransition();
  const [loaded, setLoaded] = useState<UiUserProfileLoadResult | null>(null);
  const [products, setProducts] = useState<UiUserProfileProduct[]>([]);
  const [productsPage, setProductsPage] = useState(1);
  const [productsHasMore, setProductsHasMore] = useState(false);

  useEffect(() => {
    if (!open || !memberUuid.trim()) return;

    startTransition(async () => {
      const result = await getUserProfileAction(memberUuid);
      setLoaded(result);
      setProducts(result.profile.products);
      setProductsPage(result.productsMeta?.page ?? 1);
      setProductsHasMore(result.productsMeta?.hasMore ?? false);
    });
  }, [open, memberUuid]);

  function handleProductsMore() {
    if (!memberUuid.trim() || !productsHasMore || morePending) return;
    const nextPage = productsPage + 1;
    startMoreTransition(async () => {
      const page = await listUserProfileProductsAction(memberUuid, nextPage);
      setProducts((prev) => {
        const seen = new Set(prev.map((p) => p.id));
        const appended = page.products.filter((p) => !seen.has(p.id));
        return [...prev, ...appended];
      });
      setProductsPage(page.page);
      setProductsHasMore(page.hasMore);
    });
  }

  const baseProfile: UiUserProfile = loaded?.profile ?? {
    ...USER_PROFILE_DEMO,
    nickname: previewNickname.trim() || USER_PROFILE_DEMO.nickname,
    avatarUrl: previewAvatarUrl?.trim() || USER_PROFILE_DEMO.avatarUrl,
    products: [],
  };

  const profile: UiUserProfile = {
    ...baseProfile,
    products: loaded ? products : baseProfile.products,
  };

  const sources = loaded?.sources ?? {
    nickname: previewNickname.trim() ? ("api" as const) : ("mock" as const),
    avatar: previewAvatarUrl?.trim() ? ("api" as const) : ("mock" as const),
    joinedAt: "mock" as const,
    trustGrade: "mock" as const,
    region: "mock" as const,
    rating: "mock" as const,
    products: "mock" as const,
  };

  /** 다음 API 페이지가 있을 때 더보기 (초기 size=4, 클릭 시 아래 줄 append) */
  const showProductsMore = sources.products === "api" && productsHasMore;

  return (
    <UserProfileDialog
      open={open}
      profile={profile}
      onOpenChange={onOpenChange}
      showProductsMore={showProductsMore}
      productsMorePending={morePending}
      onProductsMoreClick={handleProductsMore}
      headerExtra={
        <div className="flex flex-wrap gap-1.5 pb-2">
          <SourceBadge label="닉네임" source={sources.nickname} />
          <SourceBadge label="이미지" source={sources.avatar} />
          <SourceBadge label="가입일" source={sources.joinedAt} />
          <SourceBadge label="등급" source={sources.trustGrade} />
          <SourceBadge label="지역" source={sources.region} />
          <SourceBadge label="별점" source={sources.rating} />
          <SourceBadge label="판매목록" source={sources.products} />
          {pending ? (
            <span className="font-sans text-[10px] text-[#868686]">
              로딩…
            </span>
          ) : null}
        </div>
      }
    />
  );
}
