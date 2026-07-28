"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

import { Button } from "@/components/atoms/button";
import { FormField } from "@/components/molecules/FormField";
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
  const callbackUrl = searchParams.get("callbackUrl") || "/chat";

  const [isPending, startTransition] = useTransition();
  const [values, setValues] = useState<SigninInput>(emptySigninValues);
  const [touched, setTouched] = useState<TouchedFields>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [message, setMessage] = useState<string>();

  const realtimeErrors = useMemo(
    () => getSigninFieldErrors(values),
    [values]
  );

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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <FormField
        label="아이디"
        name="logInId"
        type="text"
        autoComplete="username"
        placeholder="user01"
        value={values.logInId}
        onChange={(e) => updateField("logInId", e.target.value)}
        error={fieldErrors.logInId?.[0]}
        disabled={isPending}
      />
      <FormField
        label="비밀번호"
        name="password"
        type="password"
        autoComplete="current-password"
        placeholder="비밀번호"
        value={values.password}
        onChange={(e) => updateField("password", e.target.value)}
        error={fieldErrors.password?.[0]}
        disabled={isPending}
      />

      {isPending ? (
        <p className="text-sm text-primary" role="status">
          로그인 중...
        </p>
      ) : message ? (
        <p className="text-sm text-destructive" role="status">
          {message}
        </p>
      ) : null}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "로그인 중..." : "로그인"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        계정이 없으신가요?{" "}
        <Link
          href="/signup"
          className="text-primary underline-offset-4 hover:underline"
        >
          회원가입
        </Link>
      </p>
    </form>
  );
}
