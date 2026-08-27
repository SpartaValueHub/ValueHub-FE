/**
 * member-regions-service 오케스트레이션.
 */
import {
  addMemberRegion,
  changeMemberRegion,
  deleteMemberRegion,
  listMyMemberRegions,
  listRegions,
  setPrimaryMemberRegion,
  verifyMemberRegion,
} from "@/lib/api/member-regions";
import { ApiError } from "@/lib/api/client";
import type {
  ApiAddMemberRegionRequest,
  ApiMemberRegion,
  ApiRegion,
  ApiVerifyMemberRegionRequest,
} from "@/types/member-regions/api";
import { splitRegionName } from "@/lib/member-regions/region-name";
import { getAuthUser } from "@/lib/session";
import { getMyMemberProfileService } from "@/services/member.service";
import type { UiMemberProfile } from "@/types/member/ui";
import type {
  UiActivityRegionLabel,
  UiMemberRegion,
  UiRegion,
} from "@/types/member-regions/ui";

export { splitRegionName };

function mapRegion(api: ApiRegion): UiRegion {
  return {
    regionCode: api.regionCode,
    regionName: api.regionName,
    centerLatitude: Number(api.centerLatitude),
    centerLongitude: Number(api.centerLongitude),
  };
}

function asRegionList(raw: unknown): ApiRegion[] {
  if (Array.isArray(raw)) return raw as ApiRegion[];
  if (raw && typeof raw === "object") {
    const obj = raw as { data?: unknown; content?: unknown };
    if (Array.isArray(obj.data)) return obj.data as ApiRegion[];
    if (Array.isArray(obj.content)) return obj.content as ApiRegion[];
  }
  return [];
}

/**
 * BE는 regionName LIKE %keyword%.
 * 시드 예: `경기도 성남시분당구 판교동` — `성남시 판교동`은 부분문자열이 아님.
 */
function regionSearchCandidates(keyword: string): string[] {
  const q = keyword.trim();
  if (!q) return [];

  const tokens = q.split(/\s+/).filter(Boolean);
  const dong = tokens[tokens.length - 1] ?? q;
  const noSpace = q.replace(/\s+/g, "");

  const candidates = [q];
  if (dong && dong !== q) candidates.push(dong);
  if (noSpace && noSpace !== q && noSpace !== dong) candidates.push(noSpace);

  // 역삼동 → 역삼 (역삼1동 등)
  if (/[동읍면가리]$/.test(dong) && dong.length > 1) {
    const stem = dong.slice(0, -1);
    if (stem.length >= 2) candidates.push(stem);
  }

  return [...new Set(candidates)];
}

function mapMemberRegion(api: ApiMemberRegion): UiMemberRegion {
  return {
    memberRegionId: api.memberRegionId,
    primary: api.primary,
    regionCode: api.regionCode,
    regionName: api.regionName,
    verified: api.verified,
    verifiedAt: api.verifiedAt,
  };
}

export async function listRegionsService(
  keyword?: string
): Promise<UiRegion[]> {
  const q = keyword?.trim() ?? "";
  if (!q) {
    return asRegionList(await listRegions()).map(mapRegion);
  }

  for (const candidate of regionSearchCandidates(q)) {
    const list = asRegionList(await listRegions(candidate));
    if (list.length > 0) {
      return list.map(mapRegion);
    }
  }

  return [];
}

export async function listMyMemberRegionsService(): Promise<UiMemberRegion[]> {
  const list = await listMyMemberRegions();
  return list.map(mapMemberRegion);
}

/**
 * 상품목록 「내 위치」 — 대표 member-region 우선, 없으면 가입 address에서 시·동.
 * 비로그인·조회 실패 시 null.
 */
export function resolveActivityRegionLabel(
  profile: UiMemberProfile | null,
  memberRegions: UiMemberRegion[]
): UiActivityRegionLabel | null {
  const primary =
    memberRegions.find((r) => r.primary) ?? memberRegions[0] ?? null;

  if (primary?.regionName.trim()) {
    const parts = splitRegionName(primary.regionName);
    if (parts.regionCity || parts.regionDong) {
      return { ...parts, source: "member_region" };
    }
  }

  const address = profile?.address?.trim() ?? "";
  if (address) {
    const parts = splitRegionName(address);
    if (parts.regionCity || parts.regionDong) {
      return { ...parts, source: "signup_address" };
    }
  }

  return null;
}

export async function resolveMyActivityRegionLabelService(): Promise<UiActivityRegionLabel | null> {
  const user = await getAuthUser();
  if (!user) return null;

  const [profileResult, regionsResult] = await Promise.allSettled([
    getMyMemberProfileService(),
    listMyMemberRegionsService(),
  ]);

  const profile =
    profileResult.status === "fulfilled" ? profileResult.value : null;
  const memberRegions =
    regionsResult.status === "fulfilled" ? regionsResult.value : [];

  return resolveActivityRegionLabel(profile, memberRegions);
}

/**
 * 인증할 regionCode를 member-region으로 맞춤.
 * - primary: 대표 슬롯 수정·재인증 (인증된 primary도 change로 교체 가능 — BE가 verified 무효화)
 * - secondary: 두 번째 동네 추가·재인증
 */
export type EnsureMemberRegionMutation =
  "none" | "created" | "changed" | "set_primary";

export type EnsureMemberRegionForVerifyResult = {
  region: UiMemberRegion;
  mutation: EnsureMemberRegionMutation;
  /** change 직전 regionCode — verify 실패 시 복구용 */
  previousRegionCode?: number;
};

/** verify 실패 후 롤백까지 포함한 인증 에러 */
export class RegionVerifyFailedError extends Error {
  code: string;
  rollbackFailed: boolean;

  constructor(
    message: string,
    options?: { code?: string; rollbackFailed?: boolean }
  ) {
    super(message);
    this.name = "RegionVerifyFailedError";
    this.code = options?.code ?? "REGION_VERIFICATION_FAILED";
    this.rollbackFailed = options?.rollbackFailed ?? false;
  }
}

export async function ensureMemberRegionForVerifyDetailed(
  regionCode: number,
  slot: "primary" | "secondary" = "primary"
): Promise<EnsureMemberRegionForVerifyResult> {
  const existing = await listMyMemberRegionsService();
  const same = existing.find((r) => r.regionCode === regionCode);

  if (slot === "secondary") {
    if (same) {
      return { region: same, mutation: "none" };
    }

    const secondary =
      existing.find((r) => !r.primary) ??
      (existing.length > 1 ? existing.find((r) => !r.primary) : null);

    if (secondary) {
      const previousRegionCode = secondary.regionCode;
      const region = await changeMemberRegionService(
        secondary.memberRegionId,
        regionCode
      );
      return { region, mutation: "changed", previousRegionCode };
    }

    if (existing.length >= 2) {
      throw new Error("동네는 최대 2개까지 등록할 수 있습니다.");
    }
    const hasPrimary = existing.length > 0;
    const region = await addMemberRegionService({
      regionCode,
      primary: !hasPrimary,
    });
    return { region, mutation: "created" };
  }

  // primary slot
  if (same) {
    if (same.primary) {
      return { region: same, mutation: "none" };
    }
    const region = await setPrimaryMemberRegionService(same.memberRegionId);
    return { region, mutation: "set_primary" };
  }

  const primary = existing.find((r) => r.primary) ?? existing[0] ?? null;

  if (!primary) {
    const region = await addMemberRegionService({ regionCode, primary: true });
    return { region, mutation: "created" };
  }

  const previousRegionCode = primary.regionCode;
  const region = await changeMemberRegionService(
    primary.memberRegionId,
    regionCode
  );
  return { region, mutation: "changed", previousRegionCode };
}

export async function ensureMemberRegionForVerifyService(
  regionCode: number,
  slot: "primary" | "secondary" = "primary"
): Promise<UiMemberRegion> {
  const result = await ensureMemberRegionForVerifyDetailed(regionCode, slot);
  return result.region;
}

/** verify 실패 시 ensure mutation에 따른 롤백 계획 */
export function planVerifyFailRollback(
  ensured: EnsureMemberRegionForVerifyResult
):
  | { kind: "delete"; memberRegionId: number }
  | {
      kind: "restore";
      memberRegionId: number;
      previousRegionCode: number;
    }
  | { kind: "noop" } {
  if (ensured.mutation === "created") {
    return {
      kind: "delete",
      memberRegionId: ensured.region.memberRegionId,
    };
  }
  if (ensured.mutation === "changed" && ensured.previousRegionCode != null) {
    return {
      kind: "restore",
      memberRegionId: ensured.region.memberRegionId,
      previousRegionCode: ensured.previousRegionCode,
    };
  }
  return { kind: "noop" };
}

async function rollbackEnsureAfterVerifyFail(
  ensured: EnsureMemberRegionForVerifyResult
): Promise<boolean> {
  const plan = planVerifyFailRollback(ensured);
  try {
    if (plan.kind === "delete") {
      await deleteMemberRegionService(plan.memberRegionId);
      return true;
    }
    if (plan.kind === "restore") {
      await changeMemberRegionService(
        plan.memberRegionId,
        plan.previousRegionCode
      );
      return true;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * @deprecated 가입 키워드 브릿지 — verifySelectedRegionService 사용 권장
 */
export async function ensurePrimaryMemberRegionService(
  keyword: string
): Promise<UiMemberRegion> {
  const existing = await listMyMemberRegionsService();
  const primary = existing.find((r) => r.primary) ?? existing[0] ?? null;
  if (primary) return primary;

  const q = keyword.trim();
  if (!q) {
    throw new Error("인증할 동네 정보가 없습니다. 활동 지역을 추가해 주세요.");
  }

  const regions = await listRegionsService(q);
  if (regions.length === 0) {
    throw new Error(
      "가입 주소와 일치하는 동네를 찾지 못했습니다. 「지역 추가」로 등록해 주세요."
    );
  }

  const tokens = q.split(/\s+/).filter(Boolean);
  const dong = tokens[tokens.length - 1] ?? q;
  const matched =
    regions.find((r) => r.regionName === q) ??
    regions.find((r) => r.regionName.endsWith(dong)) ??
    regions.find((r) => tokens.every((t) => r.regionName.includes(t))) ??
    regions[0]!;

  return addMemberRegionService({
    regionCode: matched.regionCode,
    primary: true,
  });
}

export async function verifySelectedRegionService(
  regionCode: number,
  body: ApiVerifyMemberRegionRequest,
  slot: "primary" | "secondary" = "primary"
): Promise<UiMemberRegion> {
  const ensured = await ensureMemberRegionForVerifyDetailed(regionCode, slot);
  if (ensured.region.verified && ensured.region.regionCode === regionCode) {
    return ensured.region;
  }

  try {
    return await verifyMemberRegionService(ensured.region.memberRegionId, body);
  } catch (e) {
    const rolledBack = await rollbackEnsureAfterVerifyFail(ensured);
    const isVerifyFail =
      e instanceof ApiError && e.code === "REGION_VERIFICATION_FAILED";

    if (isVerifyFail) {
      throw new RegionVerifyFailedError("현재 위치에서 인증할 수 없습니다.", {
        code: "REGION_VERIFICATION_FAILED",
        rollbackFailed: !rolledBack,
      });
    }

    if (!rolledBack) {
      const base = e instanceof Error ? e.message : "동네 인증에 실패했습니다.";
      throw new RegionVerifyFailedError(base, {
        code: e instanceof ApiError ? e.code : undefined,
        rollbackFailed: true,
      });
    }

    throw e;
  }
}

export async function addMemberRegionService(
  body: ApiAddMemberRegionRequest
): Promise<UiMemberRegion> {
  return mapMemberRegion(await addMemberRegion(body));
}

export async function changeMemberRegionService(
  memberRegionId: number,
  regionCode: number
): Promise<UiMemberRegion> {
  return mapMemberRegion(
    await changeMemberRegion(memberRegionId, { regionCode })
  );
}

export async function setPrimaryMemberRegionService(
  memberRegionId: number
): Promise<UiMemberRegion> {
  return mapMemberRegion(await setPrimaryMemberRegion(memberRegionId));
}

export async function verifyMemberRegionService(
  memberRegionId: number,
  body: ApiVerifyMemberRegionRequest
): Promise<UiMemberRegion> {
  return mapMemberRegion(await verifyMemberRegion(memberRegionId, body));
}

export async function deleteMemberRegionService(
  memberRegionId: number
): Promise<void> {
  await deleteMemberRegion(memberRegionId);
}
