import { Suspense } from "react";

import { Spinner } from "@/components/atoms/spinner";
import { SigninTemplate } from "@/components/templates/SigninTemplate";

export default function SigninPage() {
  return (
    <Suspense
      fallback={
        <Spinner
          label="로딩 중..."
          className="w-full justify-center p-8 text-sm text-vh-gold-500"
        />
      }
    >
      <SigninTemplate />
    </Suspense>
  );
}
