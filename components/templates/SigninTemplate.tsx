import { SigninAuthHeader } from "@/components/molecules/SigninAuthHeader";
import { SigninForm } from "@/components/organisms/SigninForm";

type SigninTemplateProps = {
  callbackUrl: string;
};

export function SigninTemplate({ callbackUrl }: SigninTemplateProps) {
  return (
    <main className="-mt-[60px] flex flex-1 flex-col items-start justify-center px-4 py-12 md:items-center">
      <div className="flex w-full max-w-md flex-col gap-10">
        <SigninAuthHeader />
        <SigninForm callbackUrl={callbackUrl} />
      </div>
    </main>
  );
}
