"use server";

import {
  getUserProfileForDialogService,
  listUserProfileProductsService,
} from "@/services/user-profile.service";

export async function getUserProfileAction(memberUuid: string) {
  return getUserProfileForDialogService(memberUuid);
}

/** 프로필 모달 「더보기」 — 다음 페이지 SELLING 카드 */
export async function listUserProfileProductsAction(
  memberUuid: string,
  page: number
) {
  return listUserProfileProductsService(memberUuid, page);
}
