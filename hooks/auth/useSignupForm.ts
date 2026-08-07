"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  useActionState,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { useForm } from "react-hook-form";

import { signupAction, type SignupActionState } from "@/actions/auth";
import { useAppSession } from "@/context/SessionContext";
import {
  canStartSignupAutoLogin,
  runSignupAutoLogin,
  type SignupAutoLoginPhase,
} from "@/lib/auth/signup-auto-login";
import { SIGNUP_PARTIAL_SUCCESS_MESSAGE } from "@/lib/auth/signup-partial-success";
import { resolveSignupFormUiState } from "@/lib/auth/signup-form-state";
import {
  emptySignupFormValues,
  signupFormSchema,
  type SignupFieldErrors,
  type SignupFormInput,
} from "@/types/auth/signup";

const initialState: SignupActionState = { ok: false };

export function useSignupForm() {
  const router = useRouter();
  const { refresh } = useAppSession();
  const [state, formAction, actionPending] = useActionState(
    signupAction,
    initialState
  );
  const [, startTransition] = useTransition();
  const autoLoginPhaseRef = useRef<SignupAutoLoginPhase>("idle");
  const [autoLoginPhase, setAutoLoginPhase] =
    useState<SignupAutoLoginPhase>("idle");
  const [autoLoginFailedMessage, setAutoLoginFailedMessage] =
    useState<string>();

  const isPartialSuccess = Boolean(state.partialSuccess);

  const uiState = resolveSignupFormUiState({
    actionPending,
    autoLoginPhase,
    partialSuccess: isPartialSuccess,
  });

  const form = useForm<SignupFormInput>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: emptySignupFormValues,
    mode: "onChange",
  });

  const {
    control,
    getValues,
    setValue,
    setError,
    reset,
    handleSubmit,
    formState: { errors, dirtyFields, touchedFields, isSubmitted },
  } = form;

  useEffect(() => {
    if (!state.values) return;
    reset(
      (current) => ({
        ...current,
        ...state.values,
      }),
      { keepErrors: true, keepDirty: true, keepTouched: true }
    );
  }, [state.values, reset]);

  useEffect(() => {
    if (!state.fieldErrors) return;
    (
      Object.entries(state.fieldErrors) as [
        keyof SignupFormInput,
        string[] | undefined,
      ][]
    ).forEach(([key, messages]) => {
      if (messages?.[0]) {
        setError(key, { type: "server", message: messages[0] });
      }
    });
  }, [state.fieldErrors, setError]);

  useEffect(() => {
    if (!state.ok || !state.autoLoginRequired) return;
    if (!canStartSignupAutoLogin(autoLoginPhaseRef.current)) return;

    autoLoginPhaseRef.current = "pending";
    setAutoLoginPhase("pending");
    setAutoLoginFailedMessage(undefined);

    const { logInId, password } = getValues();

    void (async () => {
      const result = await runSignupAutoLogin({ logInId, password }, signIn);

      if (!result.ok) {
        autoLoginPhaseRef.current = "failed";
        setAutoLoginPhase("failed");
        setAutoLoginFailedMessage(result.message);
        return;
      }

      autoLoginPhaseRef.current = "success";
      setAutoLoginPhase("success");

      try {
        await refresh();
      } catch {
        // SessionContext refresh 실패만으로 메인 이동을 막지 않음
      }

      router.replace("/");
      router.refresh();
    })();
  }, [state.ok, state.autoLoginRequired, getValues, refresh, router]);

  function getFieldError(name: keyof SignupFormInput): string | undefined {
    const serverError =
      name === "terms"
        ? undefined
        : state.fieldErrors?.[name as keyof SignupFieldErrors]?.[0];
    if (serverError) return serverError;

    const shouldShowClientError =
      name === "terms"
        ? Boolean(dirtyFields.terms) ||
          Boolean(touchedFields.terms) ||
          isSubmitted
        : Boolean(dirtyFields[name]) ||
          Boolean(touchedFields[name]) ||
          isSubmitted;
    if (!shouldShowClientError) return undefined;

    if (name === "terms") {
      const termsError = errors.terms as
        { message?: string; root?: { message?: string } } | undefined;
      return termsError?.message ?? termsError?.root?.message;
    }

    const fieldError = errors[name];
    if (fieldError && typeof fieldError.message === "string") {
      return fieldError.message;
    }

    return undefined;
  }

  function submitToAction(data: SignupFormInput, requestToken: string) {
    if (uiState.autoLoginFailed) return;

    autoLoginPhaseRef.current = "idle";
    setAutoLoginPhase("idle");
    setAutoLoginFailedMessage(undefined);

    const formData = new FormData();
    formData.set("requestToken", requestToken);
    formData.set("logInId", data.logInId);
    formData.set("password", data.password);
    formData.set("passwordConfirm", data.passwordConfirm);
    formData.set("email", data.email);
    formData.set("name", data.name);
    formData.set("phone", data.phone);
    formData.set("nickname", data.nickname);
    formData.set("region", data.region);
    formData.set("regionLegalDong", data.regionLegalDong);
    startTransition(() => {
      formAction(formData);
    });
  }

  return {
    control,
    getValues,
    setValue,
    setError,
    getFieldError,
    handleSubmit,
    submitToAction,
    state,
    isPending: uiState.isPending,
    submitDisabled: uiState.submitDisabled,
    showSubmitSpinner: uiState.showSubmitSpinner,
    isPartialSuccess,
    partialSuccessMessage: isPartialSuccess
      ? (state.message ?? SIGNUP_PARTIAL_SUCCESS_MESSAGE)
      : undefined,
    autoLoginFailedMessage,
    autoLoginFailed: uiState.autoLoginFailed,
    showPartialSuccessMessage: uiState.showPartialSuccessMessage,
    showAutoLoginFailedMessage: uiState.showAutoLoginFailedMessage,
  };
}
