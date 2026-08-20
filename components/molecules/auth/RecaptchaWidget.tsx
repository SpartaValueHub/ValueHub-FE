"use client";

import { useEffect, useRef } from "react";

const RECAPTCHA_V2_SCRIPT_SRC =
  "https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoad&render=explicit";

declare global {
  interface Window {
    grecaptcha?: {
      ready: (callback: () => void) => void;
      render: (
        container: HTMLElement,
        parameters: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback"?: () => void;
        }
      ) => number;
      reset: (widgetId?: number) => void;
    };
    onRecaptchaLoad?: () => void;
  }
}

export const RECAPTCHA_EXPIRED_MESSAGE =
  "인증이 만료되었습니다.\n체크박스를 다시 선택하세요.";

type RecaptchaWidgetProps = {
  siteKey: string;
  onChange: (token: string | undefined) => void;
  onExpired?: () => void;
  onLoadError?: () => void;
  expiredMessage?: string;
};

function isRecaptchaV2Ready() {
  return typeof window.grecaptcha?.render === "function";
}

function whenRecaptchaReady(callback: () => void) {
  if (isRecaptchaV2Ready()) {
    callback();
    return;
  }
  window.grecaptcha?.ready?.(callback);
}

function findExplicitRecaptchaScript() {
  return document.querySelector<HTMLScriptElement>(
    `script[src="${RECAPTCHA_V2_SCRIPT_SRC}"]`
  );
}

export function RecaptchaWidget({
  siteKey,
  onChange,
  onExpired,
  onLoadError,
  expiredMessage,
}: RecaptchaWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    onChange(undefined);

    function handleLoadFailure() {
      widgetIdRef.current = undefined;
      onChange(undefined);
      onLoadError?.();
    }

    function renderWidget() {
      if (!containerRef.current) return;

      if (!isRecaptchaV2Ready()) {
        handleLoadFailure();
        return;
      }

      if (widgetIdRef.current !== undefined) {
        window.grecaptcha!.reset(widgetIdRef.current);
        return;
      }

      widgetIdRef.current = window.grecaptcha!.render(containerRef.current, {
        sitekey: siteKey,
        callback: (token) => onChange(token),
        "expired-callback": () => {
          onChange(undefined);
          onExpired?.();
          if (widgetIdRef.current !== undefined) {
            window.grecaptcha!.reset(widgetIdRef.current);
          }
        },
      });
    }

    function scheduleRender() {
      whenRecaptchaReady(renderWidget);
    }

    function handleScriptError() {
      handleLoadFailure();
    }

    window.onRecaptchaLoad = scheduleRender;

    const existing = findExplicitRecaptchaScript();
    if (existing) {
      if (existing.dataset.loaded === "true" || isRecaptchaV2Ready()) {
        scheduleRender();
      } else {
        existing.addEventListener("load", scheduleRender, { once: true });
      }
      existing.addEventListener("error", handleScriptError);

      return () => {
        existing.removeEventListener("load", scheduleRender);
        existing.removeEventListener("error", handleScriptError);
        delete window.onRecaptchaLoad;
        widgetIdRef.current = undefined;
      };
    }

    const script = document.createElement("script");
    script.src = RECAPTCHA_V2_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.addEventListener("load", () => {
      script.dataset.loaded = "true";
    });
    script.addEventListener("error", handleScriptError, { once: true });
    document.body.appendChild(script);

    return () => {
      script.removeEventListener("error", handleScriptError);
      delete window.onRecaptchaLoad;
      widgetIdRef.current = undefined;
    };
  }, [siteKey, onChange, onExpired, onLoadError]);

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        ref={containerRef}
        className="flex justify-center [&_.rc-anchor-error-msg-container]:hidden"
      />
      {expiredMessage ? (
        <p
          className="text-center text-sm whitespace-pre-line text-destructive"
          role="status"
        >
          {expiredMessage}
        </p>
      ) : null}
    </div>
  );
}
