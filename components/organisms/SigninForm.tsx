"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

import { Button } from "@/components/atoms/button";
import { Spinner } from "@/components/atoms/spinner";
import { AuthDivider } from "@/components/molecules/AuthDivider";
import { AuthHelperLinks } from "@/components/molecules/AuthHelperLinks";
import { SigninInputField } from "@/components/molecules/SigninInputField";
import { SocialLoginGroup } from "@/components/organisms/SocialLoginGroup";
import { useAppSession } from "@/context/SessionContext";
import {
  emptySigninValues,
  signinSchema,
  type SigninInput,
} from "@/types/auth/signin";

export function SigninForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh } = useAppSession();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string>();

  const {
    control,
    handleSubmit,
    formState: { errors, touchedFields, isSubmitted },
  } = useForm<SigninInput>({
    resolver: zodResolver(signinSchema),
    defaultValues: emptySigninValues,
    mode: "onChange",
  });

  function getFieldError(name: keyof SigninInput): string | undefined {
    if (!touchedFields[name] && !isSubmitted) return undefined;
    return errors[name]?.message;
  }

  function onSubmit(data: SigninInput) {
    startTransition(async () => {
      const result = await signIn("credentials", {
        logInId: data.logInId,
        password: data.password,
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

  function onInvalid() {
    setMessage("입력값을 확인해 주세요.");
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit, onInvalid)}
      className="flex w-full flex-col gap-6"
      noValidate
    >
      <div className="flex flex-col gap-5">
        <Controller
          control={control}
          name="logInId"
          render={({ field }) => (
            <SigninInputField
              label="아이디"
              name="logInId"
              value={field.value}
              autoComplete="username"
              disabled={isPending}
              error={getFieldError("logInId")}
              onChange={(value) => {
                field.onChange(value);
                setMessage(undefined);
              }}
            />
          )}
        />
        <Controller
          control={control}
          name="password"
          render={({ field }) => (
            <SigninInputField
              label="비밀번호"
              name="password"
              type="password"
              value={field.value}
              autoComplete="current-password"
              disabled={isPending}
              error={getFieldError("password")}
              onChange={(value) => {
                field.onChange(value);
                setMessage(undefined);
              }}
            />
          )}
        />
      </div>

      <AuthHelperLinks />

      {!isPending && message ? (
        <p className="text-center text-sm text-destructive" role="status">
          {message}
        </p>
      ) : null}

      <Button
        type="submit"
        variant="brand"
        className="h-12 w-full rounded-sm text-base"
        disabled={isPending}
        aria-busy={isPending}
      >
        {isPending ? <Spinner size="sm" label="로그인 중" inline /> : "로그인"}
      </Button>

      <AuthDivider label="다른 방법으로 로그인" />

      <SocialLoginGroup />
    </form>
  );
}
