/**
 * 상품 상세 → 채팅 진입 오케스트레이션.
 * 식별자는 uuid만 받고, 표시용 닉네임은 Member 공개 프로필에서 resolve.
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
      sellerNickname = profile.nickname || null;
      sellerProfileImageUrl = profile.profileImageUrl;
    } catch {
      /* Member 조회 실패 시 uuid만으로 방 생성 가능하도록 null 유지 */
    }
  }

  return {
    productPostUuid,
    sellerMemberUuid,
    sellerNickname,
    sellerProfileImageUrl,
  };
}
