import { redirect } from "next/navigation";

import { MyPageTemplate } from "@/components/templates/mypage/MyPageTemplate";
import { requireAuth } from "@/lib/session";
import { getMyPageService } from "@/services/mypage.service";

export default async function MyPage() {
  const user = await requireAuth("/mypage");

  let data;
  try {
    data = await getMyPageService(user.memberUuid);
  } catch {
    // Auth는 통과했는데 프로필 API 전부 실패 — 목데이터로 위장하지 않고 재로그인 유도
    redirect(`/signin?callbackUrl=${encodeURIComponent("/mypage")}`);
  }

  return <MyPageTemplate data={data} />;
}
