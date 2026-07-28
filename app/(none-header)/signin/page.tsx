import { Suspense } from "react";

import { SigninTemplate } from "@/components/templates/SigninTemplate";

export default function SigninPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm">로딩 중...</div>}>
      <SigninTemplate />
    </Suspense>
  );
}
