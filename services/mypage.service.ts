/**
 * 마이페이지 오케스트레이션.
 * 1차: Member `GET /members/me`만 조회 — Auth·Product-Post 등 API 준비 후 확장.
 */
import { MOCK_MYPAGE } from "@/constants/mypage";
import { getMyMemberProfileService } from "@/services/member.service";
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

  // 시·군 (특별시/광역시 포함). 뒤에 오는 구체 시명을 우선 (경기 → 성남시)
  const cityCandidates = parts.filter((p) => /(특별시|광역시|특별자치시|시|군)$/.test(p));
  const regionCity =
    cityCandidates.find((p) => /시$/.test(p) && !/(특별시|광역시|특별자치시)$/.test(p)) ??
    cityCandidates[cityCandidates.length - 1] ??
    "";

  // 법정동·읍·면·가·리 — 마지막 매칭 (판교동)
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

function mapAccount(profile: UiMemberProfile): UiMyPageAccount {
  return {
    ...MOCK_MYPAGE.account,
    nickname: profile.nickname,
    profileImageUrl: profile.profileImageUrl,
    /** Auth 계정 조회 API 전까지 미표시 */
    joinedAt: "",
    loginId: "",
    phone: "",
    email: "",
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
    /** 리뷰·완료 수는 거래/리뷰 서비스 연동 전까지 mock 유지 */
  };
}

/** RSC 읽기 — Member만 호출 (분산: Auth·Product-Post는 별도 요청으로 확장) */
export async function getMyPageService(): Promise<UiMyPage> {
  const profile = await getMyMemberProfileService();
  return {
    ...MOCK_MYPAGE,
    account: mapAccount(profile),
    trade: mapTradeSummary(profile),
  };
}
