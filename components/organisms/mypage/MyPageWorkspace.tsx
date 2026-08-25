"use client";

import { useState } from "react";

import { MyPageAccountSection } from "@/components/organisms/mypage/MyPageAccountSection";
import { MyPageBenefitSection } from "@/components/organisms/mypage/MyPageBenefitSection";
import { MyPageSidebar } from "@/components/organisms/mypage/MyPageSidebar";
import { MyPageTradeSection } from "@/components/organisms/mypage/MyPageTradeSection";
import type { UiMyPage, UiMyPageSectionId } from "@/types/mypage/ui";

interface MyPageWorkspaceProps {
  data: UiMyPage;
}

export function MyPageWorkspace({ data }: MyPageWorkspaceProps) {
  const [active, setActive] = useState<UiMyPageSectionId>("account");

  function onSelect(id: UiMyPageSectionId) {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col px-2.5 pb-[50px] pt-8 lg:flex-row lg:items-start lg:gap-[90px] lg:px-0 lg:pt-0">
      <aside className="sticky top-[160px] hidden w-[340px] shrink-0 self-start py-[70px] lg:block">
        <MyPageSidebar active={active} onSelect={onSelect} />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col gap-[50px] lg:gap-[100px] lg:py-[70px]">
        <MyPageAccountSection account={data.account} />
        <MyPageTradeSection
          summary={data.trade}
          memberRegions={data.memberRegions}
          sellItems={data.sellItems}
          buyItems={data.buyItems}
        />
        <MyPageBenefitSection benefit={data.benefit} />
      </div>
    </div>
  );
}
