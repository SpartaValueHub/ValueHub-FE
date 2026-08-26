import { SigninAuthHeader } from "@/components/molecules/auth/SigninAuthHeader";
import { SigninForm } from "@/components/organisms/auth/SigninForm";

type SigninTemplateProps = {
  callbackUrl: string;
};

/** 로그인 — Figma login2(1121:6506) 모바일 + PC */
export function SigninTemplate({ callbackUrl }: SigninTemplateProps) {
  return (
    <main className="flex flex-1 flex-col items-center px-5 py-[100px] md:-mt-[60px] md:justify-center md:px-4 md:py-12">
      <div className="flex w-full max-w-md flex-col gap-[30px] md:gap-10">
        <SigninAuthHeader />
        <SigninForm callbackUrl={callbackUrl} />
      </div>
    </main>
  );
}
