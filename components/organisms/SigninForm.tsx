"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

import { Button } from "@/components/atoms/button";
import { AuthDivider } from "@/components/molecules/AuthDivider";
import { AuthHelperLinks } from "@/components/molecules/AuthHelperLinks";
import { SigninInputField } from "@/components/molecules/SigninInputField";
import { SocialLoginGroup } from "@/components/organisms/SocialLoginGroup";
import { useSession } from "@/context/SessionContext";
import {
  emptySigninValues,
  getSigninFieldErrors,
  signinSchema,
  type SigninFieldErrors,
  type SigninInput,
} from "@/types/auth/signin";

type TouchedFields = Partial<Record<keyof SigninInput, boolean>>;

export function SigninForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh } = useSession();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [isPending, startTransition] = useTransition();
  const [values, setValues] = useState<SigninInput>(emptySigninValues);
  const [touched, setTouched] = useState<TouchedFields>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [message, setMessage] = useState<string>();

  const realtimeErrors = useMemo(() => getSigninFieldErrors(values), [values]);

  const fieldErrors = useMemo(() => {
    const next: SigninFieldErrors = {};
    (Object.keys(values) as (keyof SigninInput)[]).forEach((key) => {
      if (submitAttempted || touched[key]) {
        next[key] = realtimeErrors[key];
      }
    });
    return next;
  }, [realtimeErrors, submitAttempted, touched, values]);

  function updateField(name: keyof SigninInput, value: string) {
    setValues((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));
    setMessage(undefined);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitAttempted(true);

    const parsed = signinSchema.safeParse(values);
    if (!parsed.success) {
      setMessage("입력값을 확인해 주세요.");
      return;
    }

    startTransition(async () => {
      const result = await signIn("credentials", {
        logInId: parsed.data.logInId,
        password: parsed.data.password,
        redirect: false,
      });

      if (result?.error || !result?.ok) {
        setMessage("아이디 또는 비밀번호가 올바르지 않습니다.");
        return;
      }

      await refresh();
      router.replace(callbackUrl);
      router.refresh();
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full flex-col gap-6"
      noValidate
    >
      <div className="flex flex-col gap-5">
        <SigninInputField
          label="아이디"
          name="logInId"
          value={values.logInId}
          autoComplete="username"
          disabled={isPending}
          error={fieldErrors.logInId?.[0]}
          onChange={(value) => updateField("logInId", value)}
        />
        <SigninInputField
          label="비밀번호"
          name="password"
          type="password"
          value={values.password}
          autoComplete="current-password"
          disabled={isPending}
          error={fieldErrors.password?.[0]}
          onChange={(value) => updateField("password", value)}
        />
      </div>

      <AuthHelperLinks />

      {isPending ? (
        <p className="text-center text-sm text-vh-gold-500" role="status">
          로그인 중...
        </p>
      ) : message ? (
        <p className="text-center text-sm text-destructive" role="status">
          {message}
        </p>
      ) : null}

      <Button
        type="submit"
        variant="brand"
        className="h-12 w-full rounded-sm text-base"
        disabled={isPending}
      >
        {isPending ? "로그인 중..." : "로그인"}
      </Button>

      <AuthDivider label="다른 방법으로 로그인" />

      <SocialLoginGroup />
    </form>
  );
}
