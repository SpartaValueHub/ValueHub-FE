import { SignupAuthHeader } from "@/components/molecules/SignupAuthHeader";
import { SignupForm } from "@/components/organisms/SignupForm";

export function SignupTemplate() {
  return (
    <main className="flex flex-1 flex-col items-center px-4 py-10 md:py-12">
      <div className="flex w-full max-w-lg flex-col gap-10">
        <SignupAuthHeader />
        <SignupForm />
      </div>
    </main>
  );
}
