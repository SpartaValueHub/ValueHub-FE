"use client";

import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState, useTransition } from "react";

import { useAppSession } from "@/context/SessionContext";
import type { SigninCaptchaController } from "@/hooks/auth/useSigninCaptcha";
import {
  isCaptchaRequiredError,
  isSignupIncompleteError,
  parseSignInError,
  signInErrorMessage,
} from "@/lib/auth/signin-errors";
import type { SigninInput } from "@/types/auth/signin";

type UseSigninFlowOptions = {
  callbackUrl: string;
  captcha: SigninCaptchaController;
};

export function useSigninFlow({ callbackUrl, captcha }: UseSigninFlowOptions) {
  const router = useRouter();
  const { refresh } = useAppSession();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string>();
  const [resumeLoginId, setResumeLoginId] = useState<string>();
  const [lockSeconds, setLockSeconds] = useState<number>();

  function clearMessages() {
    setMessage(undefined);
    captcha.setMessage(undefined);
    setResumeLoginId(undefined);
    setLockSeconds(undefined);
  }

  function dismissResumeGuidance() {
    setResumeLoginId(undefined);
  }

  function goToSignupResume() {
    if (!resumeLoginId) return;
    const params = new URLSearchParams({
      mode: "resume",
      logInId: resumeLoginId,
    });
    setResumeLoginId(undefined);
    router.push(`/signup?${params.toString()}`);
  }

  function showSignInError(rawError: string | undefined, loginId: string) {
    const parsed = parseSignInError(rawError);
    if (isSignupIncompleteError(parsed)) {
      setResumeLoginId(loginId.trim());
      setMessage(undefined);
      captcha.setMessage(undefined);
      return;
    }

    const errorMessage = signInErrorMessage(parsed);
    if (
      parsed.code === "AUTH_ACCOUNT_LOCKED" ||
      parsed.code === "AUTH_RATE_LIMITED"
    ) {
      setLockSeconds(
        parsed.retryAfterSeconds && parsed.retryAfterSeconds > 0
          ? Math.ceil(parsed.retryAfterSeconds)
          : 120
      );
      setMessage(undefined);
      captcha.setMessage(undefined);
      return;
    }
    if (isCaptchaRequiredError(parsed)) {
      captcha.requireCaptcha();
      captcha.setMessage(errorMessage);
      setMessage(undefined);
      return;
    }
    if (parsed.code === "AUTH_CAPTCHA_INVALID") {
      captcha.resetAfterFailure(errorMessage);
      setMessage(undefined);
      return;
    }

    captcha.setMessage(undefined);
    setMessage(errorMessage);
  }

  function submit(data: SigninInput) {
    if (captcha.required && !captcha.token) {
      captcha.requireCompletion();
      setMessage(undefined);
      return;
    }

    startTransition(async () => {
      const result = await signIn("credentials", {
        logInId: data.logInId,
        password: data.password,
        ...(captcha.token ? { captchaToken: captcha.token } : {}),
        redirect: false,
      });

      if (result?.error || !result?.ok) {
        showSignInError(result?.error ?? undefined, data.logInId);
        return;
      }

      await refresh();
      router.replace(callbackUrl);
      router.refresh();
    });
  }

  function handleInvalid() {
    setMessage("입력값을 확인해 주세요.");
  }

  function handleCaptchaLoadError() {
    captcha.handleLoadError();
    setMessage(undefined);
  }

  return {
    isPending,
    message,
    resumeGuidanceOpen: resumeLoginId !== undefined,
    lockOpen: lockSeconds !== undefined,
    lockSeconds: lockSeconds ?? 120,
    dismissLock: () => setLockSeconds(undefined),
    submit,
    handleInvalid,
    handleCaptchaLoadError,
    clearMessages,
    dismissResumeGuidance,
    goToSignupResume,
  };
}
