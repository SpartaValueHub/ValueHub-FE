import { MyPageTemplate } from "@/components/templates/mypage/MyPageTemplate";
import { MOCK_MYPAGE } from "@/constants/mypage";
import { requireAuth } from "@/lib/session";
import { getMyPageService } from "@/services/mypage.service";
import type { UiMyPage } from "@/types/mypage/ui";

function fallbackMyPage(): UiMyPage {
  return {
    ...MOCK_MYPAGE,
    account: {
      ...MOCK_MYPAGE.account,
      nickname: "회원",
      profileImageUrl: null,
      joinedAt: "",
      loginId: "",
      phone: "",
      email: "",
    },
  };
}

export default async function MyPage() {
  await requireAuth("/mypage");

  let data: UiMyPage;
  try {
    data = await getMyPageService();
  } catch {
    data = fallbackMyPage();
  }

  return <MyPageTemplate data={data} />;
}
