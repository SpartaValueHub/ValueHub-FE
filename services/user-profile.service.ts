/**
 * 유저 프로필 모달 오케스트레이션.
 * Member 공개 프로필 + Auth 가입일 + Product-Post 판매목록(SELLING FE 필터) + 목업(등급·지역·별점).
 * Member/가입일 404 → unavailable (탈퇴·확인 불가). 네트워크 오류는 error.
 */
import { USER_PROFILE_DEMO } from "@/constants/user-profile";
import { ApiError } from "@/lib/api/client";
import { formatListedAt } from "@/lib/format-listed-at";
import { getMemberJoinedAtService } from "@/services/auth.service";
import { getMemberPublicProfileService } from "@/services/member.service";
import { formatJoinedAtLabel } from "@/services/mypage.service";
import { listProductPostsService } from "@/services/product-posts.service";
import type {
  UiUserProfile,
  UiUserProfileFieldSources,
  UiUserProfileLoadResult,
  UiUserProfileProduct,
  UiUserProfileProductsPage,
} from "@/types/profile/ui";

/** 모달 한 줄(4칸) — BE 예시 size=4 와 동일 */
export const USER_PROFILE_PRODUCTS_PAGE_SIZE = 4;

const PLACEHOLDER_IMAGE = "/main/products/product-1.png";

function isNotFoundError(error: unknown): boolean {
  return error instanceof ApiError && error.status === 404;
}

function mapSellingProduct(item: {
  productPostUuid: string;
  name: string;
  price: number;
  tradeStatus: string;
  listedAt: string;
  thumbnailUrl: string | null;
}): UiUserProfileProduct | null {
  if (item.tradeStatus !== "SELLING") return null;
  return {
    id: item.productPostUuid,
    name: item.name,
    image: item.thumbnailUrl?.trim() || PLACEHOLDER_IMAGE,
    price: item.price,
    priceKor: "",
    timeAgo: formatListedAt(item.listedAt),
  };
}

/** 회원 판매글 1페이지 — SELLING만 (BE tradeStatus 쿼리 없음) */
export async function listUserProfileProductsService(
  memberUuid: string,
  page = 1
): Promise<UiUserProfileProductsPage> {
  const size = String(USER_PROFILE_PRODUCTS_PAGE_SIZE);
  const result = await listProductPostsService({
    memberUuid,
    page: String(page),
    size,
  });

  const products = result.items
    .map((item) =>
      mapSellingProduct({
        productPostUuid: item.productPostUuid,
        name: item.name,
        price: item.price,
        tradeStatus: item.tradeStatus,
        listedAt: item.listedAt,
        thumbnailUrl: item.thumbnailUrl,
      })
    )
    .filter((p): p is UiUserProfileProduct => p !== null);

  const hasMore = result.page < result.totalPages;

  return {
    products,
    page: result.page,
    totalPages: result.totalPages,
    hasMore,
  };
}

export async function getUserProfileForDialogService(
  memberUuid: string
): Promise<UiUserProfileLoadResult> {
  const base: UiUserProfile = {
    ...USER_PROFILE_DEMO,
    nickname: "",
    joinedAtLabel: "",
    avatarUrl: undefined,
    products: [],
  };
  const mockSources = {
    nickname: "mock" as const,
    avatar: "mock" as const,
    joinedAt: "mock" as const,
    trustGrade: "mock" as const,
    region: "mock" as const,
    rating: "mock" as const,
    products: "mock" as const,
  };

  const [memberResult, joinedResult, productsResult] = await Promise.allSettled(
    [
      getMemberPublicProfileService(memberUuid),
      getMemberJoinedAtService(memberUuid),
      listUserProfileProductsService(memberUuid, 1),
    ]
  );

  const memberNotFound =
    memberResult.status === "rejected" && isNotFoundError(memberResult.reason);
  const joinedNotFound =
    joinedResult.status === "rejected" && isNotFoundError(joinedResult.reason);

  if (memberNotFound || joinedNotFound) {
    return { status: "unavailable" };
  }

  const memberFailed = memberResult.status === "rejected";
  const joinedFailed = joinedResult.status === "rejected";
  if (memberFailed && joinedFailed) {
    return { status: "error" };
  }

  let profile: UiUserProfile = { ...base };
  const sources: UiUserProfileFieldSources = { ...mockSources };
  let productsMeta: Extract<
    UiUserProfileLoadResult,
    { status: "ok" }
  >["productsMeta"];

  if (memberResult.status === "fulfilled") {
    const publicProfile = memberResult.value;
    const hasNick = Boolean(publicProfile.nickname.trim());
    const hasAvatar = Boolean(publicProfile.profileImageUrl?.trim());
    if (hasNick) {
      profile = { ...profile, nickname: publicProfile.nickname.trim() };
      sources.nickname = "api";
    }
    if (hasAvatar) {
      profile = {
        ...profile,
        avatarUrl: publicProfile.profileImageUrl!.trim(),
      };
      sources.avatar = "api";
    }
  }

  if (joinedResult.status === "fulfilled") {
    const label = formatJoinedAtLabel(joinedResult.value.joinedAt);
    if (label) {
      profile = { ...profile, joinedAtLabel: label };
      sources.joinedAt = "api";
    }
  }

  if (productsResult.status === "fulfilled") {
    const page = productsResult.value;
    profile = { ...profile, products: page.products };
    sources.products = "api";
    productsMeta = {
      page: page.page,
      totalPages: page.totalPages,
      hasMore: page.hasMore,
    };
  }

  return { status: "ok", profile, sources, productsMeta };
}
