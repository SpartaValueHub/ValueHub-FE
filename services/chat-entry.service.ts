/**
 * 상품 상세 → 채팅 진입 오케스트레이션.
 * uuid는 필수. sellerNickname은 상세에서 넘긴 값을 우선하고,
 * 없으면 Member 공개 프로필로 보완 (POST /rooms용).
 */
import { getMemberPublicProfileService } from "@/services/member.service";
import type { UiProductChatEntry } from "@/types/chat/ui";

export async function resolveProductChatEntryService(input: {
  productPostUuid: string;
  sellerMemberUuid: string;
  /** 상세에서 이미 조회한 닉 — 있으면 Member 재조회 없이도 POST /rooms에 사용 */
  sellerNickname?: string | null;
}): Promise<UiProductChatEntry> {
  const productPostUuid = input.productPostUuid.trim();
  const sellerMemberUuid = input.sellerMemberUuid.trim();
  const fromQuery = input.sellerNickname?.trim() || null;

  let sellerNickname: string | null = fromQuery;
  let sellerProfileImageUrl: string | null = null;

  if (sellerMemberUuid) {
    try {
      const profile = await getMemberPublicProfileService(sellerMemberUuid);
      sellerNickname = sellerNickname || profile.nickname || null;
      sellerProfileImageUrl = profile.profileImageUrl;
    } catch {
      /* query 닉이 있으면 유지, 둘 다 없으면 null */
    }
  }

  return {
    productPostUuid,
    sellerMemberUuid,
    sellerNickname,
    sellerProfileImageUrl,
  };
}
