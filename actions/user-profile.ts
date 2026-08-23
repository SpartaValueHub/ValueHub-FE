"use server";

import { getUserProfileForDialogService } from "@/services/user-profile.service";

export async function getUserProfileAction(memberUuid: string) {
  return getUserProfileForDialogService(memberUuid);
}
