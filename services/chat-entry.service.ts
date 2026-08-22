/**
 * 상품 상세 → 채팅 진입 오케스트레이션.
 * uuid만 받고, 닉·이미지는 Member 공개 프로필로만 확정 (URL/클라이언트 닉 불신).
 */
import { getMemberPublicProfileService } from "@/services/member.service";
import type { UiProductChatEntry } from "@/types/chat/ui";

export async function resolveProductChatEntryService(input: {
  productPostUuid: string;
  sellerMemberUuid: string;
}): Promise<UiProductChatEntry> {
  const productPostUuid = input.productPostUuid.trim();
  const sellerMemberUuid = input.sellerMemberUuid.trim();

  let sellerNickname: string | null = null;
  let sellerProfileImageUrl: string | null = null;

  if (sellerMemberUuid) {
    try {
      const profile = await getMemberPublicProfileService(sellerMemberUuid);
      sellerNickname = profile.nickname?.trim() || null;
      sellerProfileImageUrl = profile.profileImageUrl;
    } catch {
      /* Member 실패 시 닉 null — POST /rooms는 uuid만으로 진행하거나 BE에서 resolve */
    }
  }

  return {
    productPostUuid,
    sellerMemberUuid,
    sellerNickname,
    sellerProfileImageUrl,
  };
}
