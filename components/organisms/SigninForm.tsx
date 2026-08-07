"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

import { Button } from "@/components/atoms/button";
import { Spinner } from "@/components/atoms/spinner";
import { AuthDivider } from "@/components/molecules/AuthDivider";
import { AuthHelperLinks } from "@/components/molecules/AuthHelperLinks";
import {
  RECAPTCHA_EXPIRED_MESSAGE,
  RecaptchaWidget,
} from "@/components/molecules/RecaptchaWidget";
import { SigninInputField } from "@/components/molecules/SigninInputField";
import { SocialLoginGroup } from "@/components/organisms/SocialLoginGroup";
import { useAppSession } from "@/context/SessionContext";
import {
  isCaptchaRequiredError,
  parseSignInError,
  signInErrorMessage,
} from "@/lib/auth/signin-errors";
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
  const router = useRouter();
  const { refresh } = useAppSession();

  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string>();
  const [captchaMessage, setCaptchaMessage] = useState<string>();
  const [captchaRequired, setCaptchaRequired] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string>();
  const [captchaExpiredMessage, setCaptchaExpiredMessage] = useState<string>();
  const [captchaKey, setCaptchaKey] = useState(0);

  const handleCaptchaChange = useCallback((token: string | undefined) => {
    setCaptchaToken(token);
    if (token) {
      setCaptchaExpiredMessage(undefined);
      setCaptchaMessage(undefined);
    }
  }, []);

  const handleCaptchaExpired = useCallback(() => {
    setCaptchaExpiredMessage(RECAPTCHA_EXPIRED_MESSAGE);
  }, []);

  const handleCaptchaLoadError = useCallback(() => {
    setCaptchaMessage(
      "보안 확인을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요."
    );
    setMessage(undefined);
  }, []);

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

  function clearFormMessages() {
    setMessage(undefined);
    setCaptchaMessage(undefined);
  }

  function setSignInError(parsed: ReturnType<typeof parseSignInError>) {
    const errorMessage = signInErrorMessage(parsed);

    if (
      isCaptchaRequiredError(parsed) ||
      parsed.code === "AUTH_CAPTCHA_INVALID"
    ) {
      setCaptchaMessage(errorMessage);
      setMessage(undefined);
      return;
    }

    setCaptchaMessage(undefined);
    setMessage(errorMessage);
  }

  function onSubmit(data: SigninInput) {
    if (captchaRequired && !captchaToken) {
      setCaptchaMessage("보안 확인을 완료해 주세요.");
      setMessage(undefined);
      return;
    }

    startTransition(async () => {
      const result = await signIn("credentials", {
        logInId: data.logInId,
        password: data.password,
        ...(captchaToken ? { captchaToken } : {}),
        redirect: false,
      });

      if (result?.error || !result?.ok) {
        const parsed = parseSignInError(result?.error ?? undefined);
        if (isCaptchaRequiredError(parsed)) {
          setCaptchaRequired(true);
        }
        if (parsed.code === "AUTH_CAPTCHA_INVALID") {
          setCaptchaToken(undefined);
          setCaptchaExpiredMessage(undefined);
          setCaptchaKey((key) => key + 1);
        }
        setSignInError(parsed);
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
        {!isPending && message ? (
          <p className="text-left text-sm text-destructive" role="status">
            {message}
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
              disabled={isPending}
              error={getFieldError("logInId")}
              onChange={(value) => {
                field.onChange(value);
                clearFormMessages();
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
                clearFormMessages();
              }}
            />
          )}
        />
      </div>

      {captchaRequired && recaptchaSiteKey ? (
        <div className="flex flex-col items-center gap-2">
          <RecaptchaWidget
            key={captchaKey}
            siteKey={recaptchaSiteKey}
            onChange={handleCaptchaChange}
            onExpired={handleCaptchaExpired}
            onLoadError={handleCaptchaLoadError}
            expiredMessage={captchaExpiredMessage}
          />
          {!isPending && captchaMessage ? (
            <p
              className="text-center text-sm whitespace-pre-line text-destructive"
              role="status"
            >
              {captchaMessage}
            </p>
          ) : null}
        </div>
      ) : null}

      {captchaRequired && !recaptchaSiteKey ? (
        <p className="text-center text-sm text-destructive" role="alert">
          보안 확인을 표시할 수 없습니다.
        </p>
      ) : null}

      <AuthHelperLinks />

      <Button
        type="submit"
        variant="brand"
        className="mt-[100px] h-12 w-full rounded-sm text-base"
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
