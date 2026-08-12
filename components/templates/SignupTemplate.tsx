import { SignupAuthHeader } from "@/components/molecules/SignupAuthHeader";
import { SignupForm } from "@/components/organisms/SignupForm";

type SignupTemplateProps = {
  resumeMode?: boolean;
  initialLoginId?: string;
};

export function SignupTemplate({
  resumeMode = false,
  initialLoginId,
}: SignupTemplateProps) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-5 py-10 md:py-12">
      <div className="mx-auto flex w-full max-w-[480px] flex-col items-center gap-10">
        <SignupAuthHeader resumeMode={resumeMode} />
        <SignupForm resumeMode={resumeMode} initialLoginId={initialLoginId} />
      </div>
    </main>
  );
}
