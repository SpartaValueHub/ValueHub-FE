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

function clearContainer(container: HTMLElement | null) {
  if (!container) return;
  container.innerHTML = "";
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
  const onChangeRef = useRef(onChange);
  const onExpiredRef = useRef(onExpired);
  const onLoadErrorRef = useRef(onLoadError);

  useEffect(() => {
    onChangeRef.current = onChange;
    onExpiredRef.current = onExpired;
    onLoadErrorRef.current = onLoadError;
  });

  useEffect(() => {
    let cancelled = false;
    onChangeRef.current(undefined);

    function handleLoadFailure() {
      if (cancelled) return;
      widgetIdRef.current = undefined;
      onChangeRef.current(undefined);
      onLoadErrorRef.current?.();
    }

    function renderWidget() {
      if (cancelled || !containerRef.current) return;

      if (!isRecaptchaV2Ready()) {
        handleLoadFailure();
        return;
      }

      // Strict Mode / effect 재실행 시 같은 DOM에 재렌더 방지
      if (widgetIdRef.current !== undefined) {
        window.grecaptcha!.reset(widgetIdRef.current);
        return;
      }

      if (containerRef.current.childNodes.length > 0) {
        clearContainer(containerRef.current);
      }

      try {
        widgetIdRef.current = window.grecaptcha!.render(containerRef.current, {
          sitekey: siteKey,
          callback: (token) => onChangeRef.current(token),
          "expired-callback": () => {
            onChangeRef.current(undefined);
            onExpiredRef.current?.();
            if (widgetIdRef.current !== undefined) {
              window.grecaptcha!.reset(widgetIdRef.current);
            }
          },
        });
      } catch (error) {
        // 이미 렌더된 요소면 비우고 한 번만 재시도
        const message =
          error instanceof Error ? error.message : String(error ?? "");
        if (message.includes("already been rendered")) {
          clearContainer(containerRef.current);
          widgetIdRef.current = undefined;
          try {
            widgetIdRef.current = window.grecaptcha!.render(
              containerRef.current,
              {
                sitekey: siteKey,
                callback: (token) => onChangeRef.current(token),
                "expired-callback": () => {
                  onChangeRef.current(undefined);
                  onExpiredRef.current?.();
                  if (widgetIdRef.current !== undefined) {
                    window.grecaptcha!.reset(widgetIdRef.current);
                  }
                },
              }
            );
            return;
          } catch {
            handleLoadFailure();
            return;
          }
        }
        handleLoadFailure();
      }
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
        cancelled = true;
        existing.removeEventListener("load", scheduleRender);
        existing.removeEventListener("error", handleScriptError);
        if (window.onRecaptchaLoad === scheduleRender) {
          delete window.onRecaptchaLoad;
        }
        widgetIdRef.current = undefined;
        clearContainer(containerRef.current);
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
      cancelled = true;
      script.removeEventListener("error", handleScriptError);
      if (window.onRecaptchaLoad === scheduleRender) {
        delete window.onRecaptchaLoad;
      }
      widgetIdRef.current = undefined;
      clearContainer(containerRef.current);
    };
  }, [siteKey]);

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
