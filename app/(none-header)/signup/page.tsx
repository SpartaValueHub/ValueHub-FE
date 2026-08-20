import { SignupTemplate } from "@/components/templates/auth/SignupTemplate";

type SignupPageProps = {
  searchParams: Promise<{ mode?: string; logInId?: string }>;
};

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const { mode, logInId } = await searchParams;
  const resumeMode = mode === "resume";
  const initialLoginId =
    resumeMode && logInId?.trim() ? logInId.trim() : undefined;

  return (
    <SignupTemplate resumeMode={resumeMode} initialLoginId={initialLoginId} />
  );
}
