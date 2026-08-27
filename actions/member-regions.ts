"use server";

/**
 * Member-Regions Server Actions.
 * 클라이언트는 이 Action만 호출.
 */
import {
  ApiError,
  ApiTimeoutError,
  AuthSessionExpiredError,
} from "@/lib/api/client";
import { mapActionError } from "@/lib/auth/map-action-error";
import { requireActionAuth } from "@/lib/session";
import {
  addMemberRegionService,
  deleteMemberRegionService,
  ensurePrimaryMemberRegionService,
  listMyMemberRegionsService,
  listRegionsService,
  RegionVerifyFailedError,
  setPrimaryMemberRegionService,
  verifyMemberRegionService,
  verifySelectedRegionService,
} from "@/services/member-regions.service";
import type { UiMemberRegion, UiRegion } from "@/types/member-regions/ui";

export type MemberRegionsActionResult<T> =
  { ok: true; data: T } | { ok: false; message: string; code?: string };

function toErrorMessage(e: unknown, fallback: string) {
  if (e instanceof ApiTimeoutError) {
    return "서버 응답이 지연되고 있습니다. 잠시 후 다시 시도해 주세요.";
  }
  if (e instanceof ApiError) return e.message;
  if (e instanceof Error) return e.message;
  return fallback;
}

export async function listRegionsAction(
  keyword?: string
): Promise<MemberRegionsActionResult<UiRegion[]>> {
  try {
    const data = await listRegionsService(keyword);
    return { ok: true, data };
  } catch (e) {
    return {
      ok: false,
      message: toErrorMessage(e, "지역 목록을 불러오지 못했습니다."),
    };
  }
}

export async function listMyMemberRegionsAction(): Promise<
  MemberRegionsActionResult<UiMemberRegion[]>
> {
  try {
    await requireActionAuth();
    const data = await listMyMemberRegionsService();
    return { ok: true, data };
  } catch (e) {
    if (e instanceof AuthSessionExpiredError) {
      return mapActionError(e, "내 동네 목록을 불러오지 못했습니다.");
    }
    return {
      ok: false,
      message: toErrorMessage(e, "내 동네 목록을 불러오지 못했습니다."),
    };
  }
}

export async function addMemberRegionAction(
  regionCode: number,
  primary?: boolean
): Promise<MemberRegionsActionResult<UiMemberRegion>> {
  try {
    await requireActionAuth();
    const data = await addMemberRegionService({
      regionCode,
      ...(primary != null ? { primary } : {}),
    });
    return { ok: true, data };
  } catch (e) {
    if (e instanceof AuthSessionExpiredError) {
      return mapActionError(e, "동네 등록에 실패했습니다.");
    }
    return {
      ok: false,
      message: toErrorMessage(e, "동네 등록에 실패했습니다."),
    };
  }
}

export async function setPrimaryMemberRegionAction(
  memberRegionId: number
): Promise<MemberRegionsActionResult<UiMemberRegion>> {
  try {
    await requireActionAuth();
    const data = await setPrimaryMemberRegionService(memberRegionId);
    return { ok: true, data };
  } catch (e) {
    if (e instanceof AuthSessionExpiredError) {
      return mapActionError(e, "대표 동네 지정에 실패했습니다.");
    }
    return {
      ok: false,
      message: toErrorMessage(e, "대표 동네 지정에 실패했습니다."),
    };
  }
}

export async function verifyMemberRegionAction(
  memberRegionId: number,
  latitude: number,
  longitude: number
): Promise<MemberRegionsActionResult<UiMemberRegion>> {
  try {
    await requireActionAuth();
    const data = await verifyMemberRegionService(memberRegionId, {
      latitude,
      longitude,
    });
    return { ok: true, data };
  } catch (e) {
    if (e instanceof AuthSessionExpiredError) {
      return mapActionError(e, "동네 인증에 실패했습니다.");
    }
    return {
      ok: false,
      message: toErrorMessage(e, "동네 인증에 실패했습니다."),
      code: e instanceof ApiError ? e.code : undefined,
    };
  }
}

/**
 * 가입 주소만 있고 member-region이 없을 때: 키워드로 등록 후 GPS 인증.
 * @deprecated B 플로우 — verifySelectedRegionAction 사용
 */
export async function verifyActivityRegionAction(
  latitude: number,
  longitude: number,
  regionKeyword: string
): Promise<MemberRegionsActionResult<UiMemberRegion>> {
  try {
    await requireActionAuth();
    const target = await ensurePrimaryMemberRegionService(regionKeyword);
    if (target.verified) {
      return { ok: true, data: target };
    }
    const data = await verifyMemberRegionService(target.memberRegionId, {
      latitude,
      longitude,
    });
    return { ok: true, data };
  } catch (e) {
    if (e instanceof AuthSessionExpiredError) {
      return mapActionError(e, "동네 인증에 실패했습니다.");
    }
    return {
      ok: false,
      message: toErrorMessage(e, "동네 인증에 실패했습니다."),
      code: e instanceof ApiError ? e.code : undefined,
    };
  }
}

/** 사용자가 고른 regionCode + GPS로 인증 (당근식 B) */
export async function verifySelectedRegionAction(
  regionCode: number,
  latitude: number,
  longitude: number,
  slot: "primary" | "secondary" = "primary"
): Promise<MemberRegionsActionResult<UiMemberRegion>> {
  try {
    await requireActionAuth();
    const data = await verifySelectedRegionService(
      regionCode,
      { latitude, longitude },
      slot
    );
    return { ok: true, data };
  } catch (e) {
    if (e instanceof AuthSessionExpiredError) {
      return mapActionError(e, "동네 인증에 실패했습니다.");
    }
    if (e instanceof RegionVerifyFailedError) {
      const message = e.rollbackFailed
        ? `${e.message}\n등록 취소에 실패했습니다. 새로고침 후 확인해 주세요.`
        : e.message;
      return { ok: false, message, code: e.code };
    }
    return {
      ok: false,
      message: toErrorMessage(e, "동네 인증에 실패했습니다."),
      code: e instanceof ApiError ? e.code : undefined,
    };
  }
}

export async function deleteMemberRegionAction(
  memberRegionId: number
): Promise<MemberRegionsActionResult<null>> {
  try {
    await requireActionAuth();
    await deleteMemberRegionService(memberRegionId);
    return { ok: true, data: null };
  } catch (e) {
    if (e instanceof AuthSessionExpiredError) {
      return mapActionError(e, "동네 삭제에 실패했습니다.");
    }
    return {
      ok: false,
      message: toErrorMessage(e, "동네 삭제에 실패했습니다."),
    };
  }
}
