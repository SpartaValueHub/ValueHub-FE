import { Checkbox } from "@/components/atoms/checkbox";
import { Icon } from "@/components/atoms/icons";
import { MyPageFieldRow } from "@/components/molecules/mypage/MyPageFieldRow";
import { MyPageGhostButton } from "@/components/molecules/mypage/MyPageGhostButton";
import type { UiMyPageAccount } from "@/types/mypage/ui";

interface MyPageAccountSectionProps {
  account: UiMyPageAccount;
}

export function MyPageAccountSection({ account }: MyPageAccountSectionProps) {
  return (
    <section
      id="account"
      className="flex w-full scroll-mt-[160px] flex-col gap-[30px] lg:scroll-mt-[180px]"
    >
      <div className="flex items-center gap-2.5 lg:gap-[30px]">
        <div className="relative size-[50px] shrink-0 lg:size-[70px]">
          <div className="flex size-full items-center justify-center overflow-hidden rounded-[35px] bg-[rgba(221,221,221,0.87)]">
            {account.profileImageUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={account.profileImageUrl}
                alt=""
                className="size-full object-cover"
              />
            ) : (
              <>
                <Icon name="user" size={28} className="opacity-70 lg:hidden" />
                <Icon
                  name="user"
                  size={32}
                  className="hidden opacity-70 lg:inline-block"
                />
              </>
            )}
          </div>
          <span className="absolute right-0 bottom-0 flex size-4 items-center justify-center rounded-[20px] bg-white lg:size-[22px]">
            <Icon name="camera" size={12} className="lg:hidden" />
            <Icon name="camera" size={15} className="hidden lg:inline-block" />
          </span>
        </div>
        <div className="flex flex-col justify-center gap-1.5 py-1.5">
          <div className="flex items-center gap-1.5 lg:items-end lg:gap-5">
            <p className="flex items-end gap-1.5 text-white">
              <span className="font-sans text-xl leading-none lg:text-[46px]">
                {account.nickname}
              </span>
              <span className="font-sans text-base leading-none lg:text-[34px]">
                님
              </span>
            </p>
            <button
              type="button"
              aria-label="닉네임 수정"
              className="flex size-4 shrink-0 items-end justify-center lg:size-10"
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
            <p className="font-sans text-[10px] text-[#d0d0d0] lg:px-1.5 lg:text-base">
              {account.joinedAt}
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2.5 lg:grid-cols-2 lg:gap-x-8 lg:gap-y-5">
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
          <MyPageGhostButton className="w-[134px]">
            비밀번호 변경
          </MyPageGhostButton>
        </MyPageFieldRow>
        <MyPageFieldRow
          label="전화번호"
          className="lg:col-start-1 lg:row-start-2"
        >
          <span className="mr-auto font-sans text-[13px] text-white lg:mr-0 lg:text-base">
            {account.phone || "—"}
          </span>
          <MyPageGhostButton className="w-[134px]">
            전화번호 변경
          </MyPageGhostButton>
        </MyPageFieldRow>
        <MyPageFieldRow
          label="이메일"
          className="lg:col-start-2 lg:row-start-2"
        >
          <span className="mr-auto font-sans text-[13px] text-white lg:mr-0 lg:text-base">
            {account.email || "—"}
          </span>
          <MyPageGhostButton className="w-[134px]">
            이메일 변경
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
          <MyPageGhostButton className="w-[134px]">탈퇴하기</MyPageGhostButton>
        </MyPageFieldRow>
      </div>
    </section>
  );
}
