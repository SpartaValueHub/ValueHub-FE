"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { RECAPTCHA_EXPIRED_MESSAGE } from "@/components/molecules/auth/RecaptchaWidget";
import {
  isCaptchaRequiredError,
  parseSignInError,
  signInErrorMessage,
} from "@/lib/auth/signin-errors";

type UseSignupCaptchaOptions = {
  code?: string;
  message?: string;
  retryAfterSeconds?: number;
};

export function useSignupCaptcha({
  code,
  message,
  retryAfterSeconds,
}: UseSignupCaptchaOptions) {
  const [captchaRequired, setCaptchaRequired] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string>();
  const [captchaMessage, setCaptchaMessage] = useState<string>();
  const [captchaExpiredMessage, setCaptchaExpiredMessage] = useState<string>();
  const [captchaKey, setCaptchaKey] = useState(0);
  const trackedCaptchaErrorKeyRef = useRef("");

  const captchaErrorKey = code
    ? `${code}|${retryAfterSeconds ?? ""}|${message ?? ""}`
    : "";

  useEffect(() => {
    if (
      !captchaErrorKey ||
      captchaErrorKey === trackedCaptchaErrorKeyRef.current
    ) {
      return;
    }

    trackedCaptchaErrorKeyRef.current = captchaErrorKey;

    const resumeError = parseSignInError(
      JSON.stringify({ code, message, retryAfterSeconds })
    );

    // Server action state → CAPTCHA UI; must not run during render.
    /* eslint-disable react-hooks/set-state-in-effect -- sync auth error codes after submit */
    if (isCaptchaRequiredError(resumeError)) {
      setCaptchaRequired(true);
      setCaptchaMessage(signInErrorMessage(resumeError));
    } else if (resumeError.code === "AUTH_CAPTCHA_INVALID") {
      setCaptchaRequired(true);
      setCaptchaToken(undefined);
      setCaptchaExpiredMessage(undefined);
      setCaptchaKey((key) => key + 1);
      setCaptchaMessage(signInErrorMessage(resumeError));
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [captchaErrorKey, code, message, retryAfterSeconds]);

  const handleCaptchaChange = useCallback((token: string | undefined) => {
    setCaptchaToken(token);
    if (token) {
      setCaptchaExpiredMessage(undefined);
      setCaptchaMessage(undefined);
    }
  }, []);

  const handleCaptchaExpired = useCallback(() => {
    setCaptchaToken(undefined);
    setCaptchaExpiredMessage(RECAPTCHA_EXPIRED_MESSAGE);
  }, []);

  const handleCaptchaLoadError = useCallback(() => {
    setCaptchaMessage(
      "보안 확인을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요."
    );
  }, []);

  const setCaptchaCompletionRequired = useCallback(() => {
    setCaptchaMessage("보안 확인을 완료해 주세요.");
  }, []);

  return {
    captchaRequired,
    captchaToken,
    captchaMessage,
    captchaExpiredMessage,
    captchaKey,
    handleCaptchaChange,
    handleCaptchaExpired,
    handleCaptchaLoadError,
    setCaptchaCompletionRequired,
  };
}
