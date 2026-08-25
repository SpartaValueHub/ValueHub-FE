import { ListingSideActions } from "@/components/organisms/listing/ListingSideActions";
import { MainBottomNav } from "@/components/organisms/main/MainBottomNav";
import { MyPageWorkspace } from "@/components/organisms/mypage/MyPageWorkspace";
import { cn } from "@/lib/utils";
import type { UiMyPage } from "@/types/mypage/ui";

interface MyPageTemplateProps {
  data: UiMyPage;
  className?: string;
}

/** 마이페이지 — PC 사이드바 + 모바일 세로 스택 (Figma 1229:2024) */
export function MyPageTemplate({ data, className }: MyPageTemplateProps) {
  return (
    <main
      className={cn(
        "relative flex flex-1 flex-col bg-[#323232] pb-28 pt-[140px] md:pb-0 md:pt-[140px] lg:pt-[160px]",
        className
      )}
    >
      <MyPageWorkspace data={data} />
      <ListingSideActions className="bottom-24 right-3 md:bottom-8 md:right-8" />
      <MainBottomNav activeId="profile" />
    </main>
  );
}
