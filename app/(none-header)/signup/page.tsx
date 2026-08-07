import { SignupTemplate } from "@/components/templates/SignupTemplate";

type SignupPageProps = {
  searchParams: Promise<{ mode?: string }>;
};

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const { mode } = await searchParams;
  const resumeMode = mode === "resume";

  return <SignupTemplate resumeMode={resumeMode} />;
}
