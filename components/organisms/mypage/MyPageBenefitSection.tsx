import { MyPageGhostButton } from "@/components/molecules/mypage/MyPageGhostButton";
import type { UiMyPageBenefit } from "@/types/mypage/ui";

interface MyPageBenefitSectionProps {
  benefit: UiMyPageBenefit;
}

export function MyPageBenefitSection({ benefit }: MyPageBenefitSectionProps) {
  return (
    <section
      id="payment"
      className="flex w-full scroll-mt-[120px] flex-col gap-3.5 lg:scroll-mt-[180px] lg:gap-[30px]"
    >
      <h2 className="font-sans text-base text-white lg:text-xl">
        이용중인 혜택
      </h2>
      <div className="flex w-full flex-col gap-3.5 lg:max-w-[635px] lg:flex-row lg:items-center lg:justify-between lg:gap-8">
        <div className="flex flex-col items-start gap-1.5 lg:gap-2.5">
          <p className="font-sans text-base font-medium text-white lg:text-2xl lg:font-normal">
            {benefit.title}
          </p>
          <p className="font-sans text-xs text-white lg:text-base">
            만료일 {benefit.expiresAt}
          </p>
          <p className="font-sans text-xs text-[#ababab] lg:text-base">
            {benefit.description}
          </p>
        </div>
        <div className="flex w-full items-center justify-between gap-3 lg:w-auto lg:shrink-0 lg:flex-col lg:items-start lg:justify-center lg:gap-5">
          <MyPageGhostButton className="w-[150px]">
            이용권 변경
          </MyPageGhostButton>
          <MyPageGhostButton className="w-[150px]">해지하기</MyPageGhostButton>
        </div>
      </div>
    </section>
  );
}
