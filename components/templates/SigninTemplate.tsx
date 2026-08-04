import { SigninAuthHeader } from "@/components/molecules/SigninAuthHeader";
import { SigninForm } from "@/components/organisms/SigninForm";

export function SigninTemplate() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-12">
      <div className="flex w-full max-w-md flex-col gap-10">
        <SigninAuthHeader />
        <SigninForm />
      </div>
    </main>
  );
}
