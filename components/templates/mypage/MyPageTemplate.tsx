import { ListingSideActions } from "@/components/organisms/listing/ListingSideActions";
import { MyPageWorkspace } from "@/components/organisms/mypage/MyPageWorkspace";
import { cn } from "@/lib/utils";
import type { UiMyPage } from "@/types/mypage/ui";

interface MyPageTemplateProps {
  data: UiMyPage;
  className?: string;
}

export function MyPageTemplate({ data, className }: MyPageTemplateProps) {
  return (
    <main
      className={cn(
        "flex flex-1 flex-col bg-[#323232] pt-[140px] lg:pt-[160px]",
        className
      )}
    >
      <MyPageWorkspace data={data} />
      <ListingSideActions />
    </main>
  );
}
