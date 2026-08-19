"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/atoms/button";
import { Spinner } from "@/components/atoms/spinner";
import { AuthDivider } from "@/components/molecules/AuthDivider";
import { AuthHelperLinks } from "@/components/molecules/AuthHelperLinks";
import { ConfirmModal } from "@/components/molecules/ConfirmModal";
import { RecaptchaWidget } from "@/components/molecules/RecaptchaWidget";
import { SigninInputField } from "@/components/molecules/SigninInputField";
import { SocialLoginGroup } from "@/components/organisms/SocialLoginGroup";
import { useSigninCaptcha } from "@/hooks/auth/useSigninCaptcha";
import { useSigninFlow } from "@/hooks/auth/useSigninFlow";
import { SIGNUP_INCOMPLETE_GUIDANCE_MESSAGE } from "@/lib/auth/signin-errors";
import {
  emptySigninValues,
  signinSchema,
  type SigninInput,
} from "@/types/auth/signin";

const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? "";

type SigninFormProps = {
  callbackUrl: string;
};

export function SigninForm({ callbackUrl }: SigninFormProps) {
  const captcha = useSigninCaptcha();
  const signin = useSigninFlow({ callbackUrl, captcha });

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

  return (
    <form
      onSubmit={handleSubmit(signin.submit, signin.handleInvalid)}
      className="flex w-full flex-col gap-6"
      noValidate
    >
      <div className="flex flex-col gap-5">
        {!signin.isPending && signin.message ? (
          <p className="text-left text-sm text-destructive" role="status">
            {signin.message}
          </p>
        ) : null}

        <Controller
          control={control}
          name="logInId"
          render={({ field }) => (
            <SigninInputField
              label="아이디"
              name="logInId"
              value={field.value}
              autoComplete="username"
              disabled={signin.isPending}
              error={getFieldError("logInId")}
              onChange={(value) => {
                field.onChange(value);
                signin.clearMessages();
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
              disabled={signin.isPending}
              error={getFieldError("password")}
              onChange={(value) => {
                field.onChange(value);
                signin.clearMessages();
              }}
            />
          )}
        />
      </div>

      {captcha.required && recaptchaSiteKey ? (
        <div className="flex flex-col items-center gap-2">
          <RecaptchaWidget
            key={captcha.resetKey}
            siteKey={recaptchaSiteKey}
            onChange={captcha.handleChange}
            onExpired={captcha.handleExpired}
            onLoadError={signin.handleCaptchaLoadError}
            expiredMessage={captcha.expiredMessage}
          />
          {!signin.isPending && captcha.message ? (
            <p
              className="text-center text-sm whitespace-pre-line text-destructive"
              role="status"
            >
              {captcha.message}
            </p>
          ) : null}
        </div>
      ) : null}

      {captcha.required && !recaptchaSiteKey ? (
        <p className="text-center text-sm text-destructive" role="alert">
          보안 확인을 표시할 수 없습니다.
        </p>
      ) : null}

      <AuthHelperLinks />

      <Button
        type="submit"
        variant="brand"
        className="mt-[100px] h-12 w-full rounded-sm text-base"
        disabled={signin.isPending}
        aria-busy={signin.isPending}
      >
        {signin.isPending ? (
          <Spinner size="sm" label="로그인 중" inline />
        ) : (
          "로그인"
        )}
      </Button>

      <AuthDivider label="다른 방법으로 로그인" />

      <SocialLoginGroup />

      <ConfirmModal
        open={signin.resumeGuidanceOpen}
        title="회원가입 미완료"
        message={SIGNUP_INCOMPLETE_GUIDANCE_MESSAGE}
        confirmLabel="가입 완료하기"
        cancelLabel="취소"
        onConfirm={signin.goToSignupResume}
        onCancel={signin.dismissResumeGuidance}
        dismissible={false}
      />
    </form>
  );
}
