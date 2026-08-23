"use client";

import { useEffect, useState, useTransition } from "react";

import { AlertDialog } from "@/components/molecules/overlay/AlertDialog";
import { UserProfileDialog } from "@/components/molecules/overlay/UserProfileDialog";
import {
  getUserProfileAction,
  listUserProfileProductsAction,
} from "@/actions/user-profile";
import type {
  UiProfileFieldSource,
  UiUserProfile,
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

type HostPhase = "idle" | "loading" | "profile" | "unavailable";

interface SellerProfileDialogHostProps {
  open: boolean;
  memberUuid: string;
  /** 상세에서 이미 조회한 값 — 정상 프로필 표시 시 참고용(로딩 중엔 모달 미표시) */
  previewNickname?: string;
  previewAvatarUrl?: string | null;
  onOpenChange: (open: boolean) => void;
}

/** 상품 상세 판매자 → 프로필 모달 / 확인 불가 알림 */
export function SellerProfileDialogHost({
  open,
  memberUuid,
  onOpenChange,
}: SellerProfileDialogHostProps) {
  const [pending, startTransition] = useTransition();
  const [morePending, startMoreTransition] = useTransition();
  const [phase, setPhase] = useState<HostPhase>("idle");
  const [profile, setProfile] = useState<UiUserProfile | null>(null);
  const [sources, setSources] = useState<{
    nickname: UiProfileFieldSource;
    avatar: UiProfileFieldSource;
    joinedAt: UiProfileFieldSource;
    trustGrade: UiProfileFieldSource;
    region: UiProfileFieldSource;
    rating: UiProfileFieldSource;
    products: UiProfileFieldSource;
  } | null>(null);
  const [products, setProducts] = useState<UiUserProfileProduct[]>([]);
  const [productsPage, setProductsPage] = useState(1);
  const [productsHasMore, setProductsHasMore] = useState(false);

  function resetHost() {
    setPhase("idle");
    setProfile(null);
    setSources(null);
    setProducts([]);
    setProductsPage(1);
    setProductsHasMore(false);
  }

  function handleOpenChange(next: boolean) {
    if (!next) resetHost();
    onOpenChange(next);
  }

  useEffect(() => {
    if (!open || !memberUuid.trim()) return;

    const uuid = memberUuid.trim();
    let cancelled = false;

    startTransition(async () => {
      const result = await getUserProfileAction(uuid);
      if (cancelled) return;

      if (result.status === "unavailable") {
        setPhase("unavailable");
        return;
      }

      if (result.status === "error") {
        resetHost();
        onOpenChange(false);
        return;
      }

      setProfile(result.profile);
      setSources(result.sources);
      setProducts(result.profile.products);
      setProductsPage(result.productsMeta?.page ?? 1);
      setProductsHasMore(result.productsMeta?.hasMore ?? false);
      setPhase("profile");
    });

    return () => {
      cancelled = true;
    };
  }, [open, memberUuid, onOpenChange]);

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

  function close() {
    handleOpenChange(false);
  }

  const showProductsMore = sources?.products === "api" && productsHasMore;

  const dialogProfile: UiUserProfile | null = profile
    ? { ...profile, products }
    : null;

  return (
    <>
      {dialogProfile && sources ? (
        <UserProfileDialog
          open={open && phase === "profile"}
          profile={dialogProfile}
          onOpenChange={handleOpenChange}
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
      ) : null}

      <AlertDialog
        open={open && phase === "unavailable"}
        onOpenChange={(next) => {
          if (!next) close();
        }}
        primaryLabel="확인"
        onPrimary={close}
      >
        프로필을 확인할 수 없는 사용자입니다.
      </AlertDialog>
    </>
  );
}
