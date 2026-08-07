import { SignupAuthHeader } from "@/components/molecules/SignupAuthHeader";
import { SignupForm } from "@/components/organisms/SignupForm";

type SignupTemplateProps = {
  resumeMode?: boolean;
};

export function SignupTemplate({ resumeMode = false }: SignupTemplateProps) {
  return (
    <main className="flex flex-1 flex-col items-start px-4 py-10 md:items-center md:py-12">
      <div className="flex w-full max-w-lg flex-col gap-10">
        <SignupAuthHeader resumeMode={resumeMode} />
        <SignupForm resumeMode={resumeMode} />
      </div>
    </main>
  );
}
