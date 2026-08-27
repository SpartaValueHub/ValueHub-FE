/**
 * 마이페이지 오케스트레이션.
 * Member `GET /members/me` + Auth `GET /auth/me` + Product-Post 판매 목록 병렬.
 * 구매 목록은 Reservation API 준비 전까지 mock 유지.
 */
import { MOCK_MYPAGE, MYPAGE_SELL_PAGE_SIZE } from "@/constants/mypage";
import { resolveTradeLocationLabel } from "@/lib/product-posts/trade-location";
import { splitRegionName } from "@/lib/member-regions/region-name";
import { getMyAuthAccountService } from "@/services/auth.service";
import { getMyMemberProfileService } from "@/services/member.service";
import { listMyMemberRegionsService } from "@/services/member-regions.service";
import { listProductPostsService } from "@/services/product-posts.service";
import type { UiAuthAccount } from "@/types/auth/ui";
import type { UiMemberProfile } from "@/types/member/ui";
import type { UiMemberRegion } from "@/types/member-regions/ui";
import type {
  UiMyPage,
  UiMyPageAccount,
  UiMyPageSellListPage,
  UiMyPageTradeItem,
  UiMyPageTradeSummary,
  UiTradeStatus,
  UiTrustGradeLevel,
} from "@/types/mypage/ui";
import type { TradeStatus, UiProductPostCard } from "@/types/product-posts/ui";

const GRADE_ORDER: UiTrustGradeLevel[] = [
  "bronze",
  "silver",
  "gold",
  "platinum",
  "diamond",
];

const GRADE_LABEL: Record<UiTrustGradeLevel, string> = {
  bronze: "Bronze",
  silver: "Silver",
  gold: "Gold",
  platinum: "Platinum",
  diamond: "Diamond",
};

export type UiMyPageSellStatusFilter =
  "all" | "selling" | "reserved" | "completed";

/** BE memberGrade (BRONZE…) → UI trust grade */
export function mapMemberGradeToTrustGrade(
  memberGrade: string
): UiTrustGradeLevel {
  const key = memberGrade.trim().toLowerCase();
  if ((GRADE_ORDER as string[]).includes(key)) {
    return key as UiTrustGradeLevel;
  }
  return "bronze";
}

function nextGradeHint(level: UiTrustGradeLevel): string {
  const index = GRADE_ORDER.indexOf(level);
  if (index < 0 || index >= GRADE_ORDER.length - 1) {
    return "최고 거래안심등급입니다. 성실한 거래 활동을 이어가 주세요.";
  }
  const next = GRADE_ORDER[index + 1]!;
  return `다음 거래안심등급은 ${GRADE_LABEL[next]} 입니다. 성실한 거래 활동과 긍정적인 거래 이력을 쌓으면 다음 등급으로 승급할 수 있습니다.`;
}

/**
 * Member address → UI용 짧은 시·동만 (구·도 제외).
 * 예: `경기 성남시 분당구 판교동` → 성남 / 판교동
 */
export function mapAddressToRegion(address: string | null): {
  regionCity: string;
  regionDong: string;
} {
  const trimmed = address?.trim() ?? "";
  if (!trimmed) {
    return {
      regionCity: MOCK_MYPAGE.trade.regionCity,
      regionDong: MOCK_MYPAGE.trade.regionDong,
    };
  }

  const parsed = splitRegionName(trimmed);
  if (!parsed.regionCity && !parsed.regionDong) {
    return {
      regionCity: MOCK_MYPAGE.trade.regionCity,
      regionDong: MOCK_MYPAGE.trade.regionDong,
    };
  }

  return parsed;
}

/** `2026-08-04T08:00:00Z` → `2026.08.04일 가입` */
export function formatJoinedAtLabel(joinedAt: string): string {
  const date = new Date(joinedAt);
  if (Number.isNaN(date.getTime())) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}.${m}.${d}일 가입`;
}

/** listedAt ISO → `2026.07.07` (마이페이지 거래 행) */
export function formatMyPageTradeDate(listedAt: string): string {
  const date = new Date(listedAt);
  if (Number.isNaN(date.getTime())) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}.${m}.${d}`;
}

/** `01012345678` → `010-1234-5678` (그 외 길이는 원문) */
export function formatPhoneDisplay(phoneNumber: string): string {
  const digits = phoneNumber.replace(/\D/g, "");
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return phoneNumber.trim();
}

function mapTradeStatus(status: TradeStatus): UiTradeStatus {
  if (status === "RESERVED") return "reserved";
  if (status === "SOLD_OUT") return "completed";
  return "selling";
}

function toBeTradeStatus(
  filter: UiMyPageSellStatusFilter
): TradeStatus | undefined {
  if (filter === "selling") return "SELLING";
  if (filter === "reserved") return "RESERVED";
  if (filter === "completed") return "SOLD_OUT";
  return undefined;
}

export function mapProductCardToSellItem(
  card: UiProductPostCard
): UiMyPageTradeItem {
  const status = mapTradeStatus(card.tradeStatus);
  return {
    id: card.productPostUuid,
    status,
    title: card.name,
    date: formatMyPageTradeDate(card.listedAt),
    location: resolveTradeLocationLabel({
      regionDong: card.regionDong,
      regionGu: card.regionGu,
      placeName: card.placeName,
    }),
    price: card.price,
    action: status === "selling" ? "boost" : undefined,
    review: { kind: "locked" },
  };
}

export async function listMySellPostsService(
  memberUuid: string,
  filter: UiMyPageSellStatusFilter = "all",
  page = 1
): Promise<UiMyPageSellListPage> {
  const uuid = memberUuid.trim();
  const tradeStatus = toBeTradeStatus(filter);
  const result = await listProductPostsService({
    memberUuid: uuid,
    page: String(page),
    size: String(MYPAGE_SELL_PAGE_SIZE),
    ...(tradeStatus ? { tradeStatus } : {}),
  });

  return {
    items: result.items.map(mapProductCardToSellItem),
    page: result.page,
    totalPages: result.totalPages,
    totalElements: result.totalElements,
    hasMore: result.page < result.totalPages,
  };
}

async function countSoldOutPosts(memberUuid: string): Promise<number> {
  const result = await listProductPostsService({
    memberUuid: memberUuid.trim(),
    tradeStatus: "SOLD_OUT",
    page: "1",
    size: "1",
  });
  return result.totalElements;
}

function mapAccount(
  profile: UiMemberProfile | null,
  auth: UiAuthAccount | null
): UiMyPageAccount {
  return {
    ...MOCK_MYPAGE.account,
    nickname: profile?.nickname?.trim() || "회원",
    profileImageUrl: profile?.profileImageUrl ?? null,
    joinedAt: auth?.joinedAt ? formatJoinedAtLabel(auth.joinedAt) : "",
    loginId: auth?.logInId?.trim() ?? "",
    phone: auth?.phoneNumber ? formatPhoneDisplay(auth.phoneNumber) : "",
    email: auth?.email?.trim() ?? "",
  };
}

function mapTradeSummary(
  profile: UiMemberProfile,
  memberRegions: UiMemberRegion[],
  completedCount: number
): UiMyPageTradeSummary {
  const trustGrade = mapMemberGradeToTrustGrade(profile.memberGrade);
  const primary =
    memberRegions.find((r) => r.primary) ?? memberRegions[0] ?? null;
  const fromRegion = primary
    ? splitRegionName(primary.regionName)
    : mapAddressToRegion(profile.address);

  return {
    ...MOCK_MYPAGE.trade,
    trustGrade,
    completedCount,
    regionCity: fromRegion.regionCity || MOCK_MYPAGE.trade.regionCity,
    regionDong: fromRegion.regionDong || MOCK_MYPAGE.trade.regionDong,
    nextGradeHint: nextGradeHint(trustGrade),
  };
}

/**
 * RSC 읽기 — Auth·Member·member-regions·판매목록 병렬.
 * 한쪽 실패해도 가능한 쪽은 표시 (전부 실패 시 page fallback).
 */
export async function getMyPageService(memberUuid: string): Promise<UiMyPage> {
  const uuid = memberUuid.trim();
  const [memberResult, authResult, regionsResult, sellResult, soldCountResult] =
    await Promise.allSettled([
      getMyMemberProfileService(),
      getMyAuthAccountService(),
      listMyMemberRegionsService(),
      listMySellPostsService(uuid, "all", 1),
      countSoldOutPosts(uuid),
    ]);

  const profile =
    memberResult.status === "fulfilled" ? memberResult.value : null;
  const auth = authResult.status === "fulfilled" ? authResult.value : null;
  const memberRegions =
    regionsResult.status === "fulfilled" ? regionsResult.value : [];
  const sellList =
    sellResult.status === "fulfilled"
      ? sellResult.value
      : {
          items: [] as UiMyPageTradeItem[],
          page: 1,
          totalPages: 0,
          totalElements: 0,
          hasMore: false,
        };
  const completedCount =
    soldCountResult.status === "fulfilled"
      ? soldCountResult.value
      : MOCK_MYPAGE.trade.completedCount;

  if (!profile && !auth) {
    throw new Error("마이페이지 프로필을 불러오지 못했습니다.");
  }

  return {
    ...MOCK_MYPAGE,
    account: mapAccount(profile, auth),
    trade: profile
      ? mapTradeSummary(profile, memberRegions, completedCount)
      : { ...MOCK_MYPAGE.trade, completedCount },
    memberRegions,
    sellItems: sellList.items,
    sellList,
  };
}
