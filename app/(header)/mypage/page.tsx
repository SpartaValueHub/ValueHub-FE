import { MyPageTemplate } from "@/components/templates/mypage/MyPageTemplate";
import { MOCK_MYPAGE } from "@/constants/mypage";

export default function MyPage() {
  return <MyPageTemplate data={MOCK_MYPAGE} />;
}
