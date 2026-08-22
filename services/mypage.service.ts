/**
 * 마이페이지 오케스트레이션.
 * Member `GET /members/me` + Auth `GET /auth/me` 병렬 조회 (서비스 분산).
 * Product-Post 판매/구매 목록 등은 API 준비 후 확장.
 */
import { MOCK_MYPAGE } from "@/constants/mypage";
import { getMyAuthAccountService } from "@/services/auth.service";
import { getMyMemberProfileService } from "@/services/member.service";
import type { UiAuthAccount } from "@/types/auth/ui";
import type { UiMemberProfile } from "@/types/member/ui";
import type {
  UiMyPage,
  UiMyPageAccount,
  UiMyPageTradeSummary,
  UiTrustGradeLevel,
} from "@/types/mypage/ui";

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
 * Member address(예: `경기 성남시 분당구 판교동`) → UI용 시·동만.
 * Figma/마크업이 `부산시` + `초량동` 2줄이라 구·도 토큰은 버린다.
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

  const parts = trimmed.split(/\s+/).filter(Boolean);

  const cityCandidates = parts.filter((p) =>
    /(특별시|광역시|특별자치시|시|군)$/.test(p)
  );
  const regionCity =
    cityCandidates.find(
      (p) => /시$/.test(p) && !/(특별시|광역시|특별자치시)$/.test(p)
    ) ??
    cityCandidates[cityCandidates.length - 1] ??
    "";

  const dongCandidates = parts.filter((p) => /(동|읍|면|가|리)$/.test(p));
  const regionDong = dongCandidates[dongCandidates.length - 1] ?? "";

  if (!regionCity && !regionDong) {
    return {
      regionCity: MOCK_MYPAGE.trade.regionCity,
      regionDong: MOCK_MYPAGE.trade.regionDong,
    };
  }

  return { regionCity, regionDong };
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

function mapTradeSummary(profile: UiMemberProfile): UiMyPageTradeSummary {
  const trustGrade = mapMemberGradeToTrustGrade(profile.memberGrade);
  const { regionCity, regionDong } = mapAddressToRegion(profile.address);
  return {
    ...MOCK_MYPAGE.trade,
    trustGrade,
    regionCity,
    regionDong,
    nextGradeHint: nextGradeHint(trustGrade),
  };
}

/**
 * RSC 읽기 — Auth·Member 병렬 호출.
 * 한쪽 실패해도 가능한 쪽은 표시 (전부 실패 시 page fallback).
 */
export async function getMyPageService(): Promise<UiMyPage> {
  const [memberResult, authResult] = await Promise.allSettled([
    getMyMemberProfileService(),
    getMyAuthAccountService(),
  ]);

  const profile =
    memberResult.status === "fulfilled" ? memberResult.value : null;
  const auth = authResult.status === "fulfilled" ? authResult.value : null;

  if (!profile && !auth) {
    throw new Error("마이페이지 프로필을 불러오지 못했습니다.");
  }

  return {
    ...MOCK_MYPAGE,
    account: mapAccount(profile, auth),
    trade: profile ? mapTradeSummary(profile) : MOCK_MYPAGE.trade,
  };
}
