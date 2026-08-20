import { SigninTemplate } from "@/components/templates/auth/SigninTemplate";

type SigninPageProps = {
  searchParams: Promise<{ callbackUrl?: string }>;
};

export default async function SigninPage({ searchParams }: SigninPageProps) {
  const { callbackUrl } = await searchParams;

  return <SigninTemplate callbackUrl={callbackUrl ?? "/"} />;
}
