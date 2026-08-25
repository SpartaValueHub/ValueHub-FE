import { Checkbox } from "@/components/atoms/checkbox";
import { Icon } from "@/components/atoms/icons";
import { MyPageFieldRow } from "@/components/molecules/mypage/MyPageFieldRow";
import { MyPageGhostButton } from "@/components/molecules/mypage/MyPageGhostButton";
import { MyPageProfileAvatar } from "@/components/molecules/mypage/MyPageProfileAvatar";
import { MyPageWithdrawButton } from "@/components/molecules/mypage/MyPageWithdrawButton";
import type { UiMyPageAccount } from "@/types/mypage/ui";

interface MyPageAccountSectionProps {
  account: UiMyPageAccount;
}

/** 마이페이지 계정 정보 — Figma my page(1229:2024) 모바일 + PC */
export function MyPageAccountSection({ account }: MyPageAccountSectionProps) {
  return (
    <section
      id="account"
      className="flex w-full scroll-mt-[160px] flex-col gap-[30px] lg:scroll-mt-[180px]"
    >
      <div className="flex items-center gap-2.5 lg:gap-[30px]">
        <MyPageProfileAvatar imageUrl={account.profileImageUrl} />
        <div className="flex min-w-0 flex-col justify-center gap-1.5 py-1.5">
          <div className="flex items-center gap-1.5 lg:items-end lg:gap-5">
            <p className="flex min-w-0 items-end gap-1.5 text-white">
              <span className="truncate font-sans text-xl leading-none lg:text-[46px]">
                {account.nickname}
              </span>
              <span className="shrink-0 font-sans text-base leading-none lg:text-[34px]">
                님
              </span>
            </p>
            <button
              type="button"
              aria-label="닉네임 수정"
              className="flex size-4 shrink-0 items-center justify-center lg:size-10"
            >
              <Icon name="edit" size={16} className="invert lg:hidden" />
              <Icon
                name="edit"
                size={40}
                className="hidden invert lg:inline-block"
              />
            </button>
          </div>
          {account.joinedAt ? (
            <p className="font-sans text-[10px] leading-normal text-[#d0d0d0] lg:px-1.5 lg:text-base">
              {account.joinedAt}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-2.5 lg:grid lg:grid-cols-2 lg:gap-x-8 lg:gap-y-5">
        <MyPageFieldRow
          label="아이디"
          className="justify-start lg:col-start-1 lg:row-start-1"
        >
          <span className="font-sans text-[13px] text-white lg:text-base">
            {account.loginId || "—"}
          </span>
        </MyPageFieldRow>
        <MyPageFieldRow
          label="비밀번호"
          className="lg:col-start-2 lg:row-start-1"
        >
          <MyPageGhostButton className="w-auto shrink-0 px-3.5 py-1.5 text-xs lg:w-[134px] lg:px-[30px] lg:py-2 lg:text-sm">
            <span className="lg:hidden">변경하기</span>
            <span className="hidden lg:inline">비밀번호 변경</span>
          </MyPageGhostButton>
        </MyPageFieldRow>
        <MyPageFieldRow
          label="전화번호"
          className="lg:col-start-1 lg:row-start-2"
        >
          <span className="mr-auto font-sans text-[13px] text-white lg:mr-0 lg:text-base">
            {account.phone || "—"}
          </span>
          <MyPageGhostButton className="w-auto shrink-0 px-3.5 py-1.5 text-xs lg:w-[134px] lg:px-[30px] lg:py-2 lg:text-sm">
            <span className="lg:hidden">변경하기</span>
            <span className="hidden lg:inline">전화번호 변경</span>
          </MyPageGhostButton>
        </MyPageFieldRow>
        <MyPageFieldRow
          label="이메일"
          className="lg:col-start-2 lg:row-start-2"
        >
          <span className="mr-auto truncate font-sans text-[13px] text-white lg:mr-0 lg:text-base">
            {account.email || "—"}
          </span>
          <MyPageGhostButton className="w-auto shrink-0 px-3.5 py-1.5 text-xs lg:w-[134px] lg:px-[30px] lg:py-2 lg:text-sm">
            <span className="lg:hidden">변경하기</span>
            <span className="hidden lg:inline">이메일 변경</span>
          </MyPageGhostButton>
        </MyPageFieldRow>
        <MyPageFieldRow
          label="마케팅 수신동의"
          className="justify-start lg:col-start-1 lg:row-start-3"
        >
          <div className="flex items-center gap-5 lg:gap-10">
            <Checkbox
              id="mypage-marketing-email"
              label="E-mail"
              defaultChecked={account.marketingEmail}
              className="gap-1.5 text-[13px] text-white lg:text-sm"
            />
            <Checkbox
              id="mypage-marketing-sms"
              label="SMS"
              defaultChecked={account.marketingSms}
              className="gap-1.5 text-[13px] text-white lg:text-sm"
            />
          </div>
        </MyPageFieldRow>
        <MyPageFieldRow
          label="회원탈퇴"
          className="lg:col-start-2 lg:row-start-3"
        >
          <MyPageWithdrawButton />
        </MyPageFieldRow>
      </div>
    </section>
  );
}
