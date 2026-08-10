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
import { useForm, type FieldErrors } from "react-hook-form";

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
  emptySignupResumeFormValues,
  signupFormSchema,
  signupResumeFormSchema,
  type SignupFieldErrors,
  type SignupFormInput,
  type SignupResumeFormInput,
} from "@/types/auth/signup";

const initialState: SignupActionState = { ok: false };

type UseSignupFormOptions = {
  resumeMode?: boolean;
  initialLoginId?: string;
};

export function useSignupForm(options: UseSignupFormOptions = {}) {
  const resumeMode = Boolean(options.resumeMode);
  const initialLoginId = options.initialLoginId?.trim();
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
  const isResumeFlow = resumeMode || isPartialSuccess;
  const isResumeFlowRef = useRef(isResumeFlow);

  useEffect(() => {
    isResumeFlowRef.current = isResumeFlow;
  }, [isResumeFlow]);

  const uiState = resolveSignupFormUiState({
    actionPending,
    autoLoginPhase,
    partialSuccess: isPartialSuccess,
  });

  const form = useForm<SignupFormInput | SignupResumeFormInput>({
    // partialSuccess로 전환돼도 resume 스키마를 쓰도록 ref로 동적 선택
    resolver: async (values, context, options) => {
      const schema = isResumeFlowRef.current
        ? signupResumeFormSchema
        : signupFormSchema;
      return zodResolver(schema)(values, context, options);
    },
    defaultValues: resumeMode
      ? {
          ...emptySignupResumeFormValues,
          ...(initialLoginId ? { logInId: initialLoginId } : {}),
        }
      : emptySignupFormValues,
    mode: "onChange",
  });

  const {
    control,
    getValues,
    setValue,
    setError,
    trigger,
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

      try {
        await refresh();
      } catch {
        // SessionContext refresh 실패만으로 메인 이동을 막지 않음
      }

      autoLoginPhaseRef.current = "success";
      setAutoLoginPhase("success");
    })();
  }, [state.ok, state.autoLoginRequired, getValues, refresh]);

  function goToMain() {
    router.replace("/");
    router.refresh();
  }

  function getFieldError(
    name: keyof SignupFormInput | keyof SignupResumeFormInput
  ): string | undefined {
    const serverError =
      name === "terms"
        ? undefined
        : state.fieldErrors?.[name as keyof SignupFieldErrors]?.[0];
    if (serverError) return serverError;

    const shouldShowClientError =
      name === "terms"
        ? Boolean(
            (dirtyFields as Partial<SignupFormInput>).terms ||
            (touchedFields as Partial<SignupFormInput>).terms ||
            isSubmitted
          )
        : Boolean(
            dirtyFields[name as keyof typeof dirtyFields] ||
            touchedFields[name as keyof typeof touchedFields] ||
            isSubmitted
          );
    if (!shouldShowClientError) return undefined;

    if (name === "terms") {
      const termsError = (errors as FieldErrors<SignupFormInput>).terms as
        { message?: string; root?: { message?: string } } | undefined;
      return termsError?.message ?? termsError?.root?.message;
    }

    const fieldError = (
      errors as Record<string, { message?: string } | undefined>
    )[name];
    if (fieldError && typeof fieldError.message === "string") {
      return fieldError.message;
    }

    return undefined;
  }

  function submitToAction(
    data: SignupFormInput | SignupResumeFormInput,
    options?: { requestToken?: string; captchaToken?: string }
  ) {
    if (uiState.autoLoginFailed) return;

    autoLoginPhaseRef.current = "idle";
    setAutoLoginPhase("idle");
    setAutoLoginFailedMessage(undefined);

    const formData = new FormData();
    if (isResumeFlow) {
      formData.set("resumeMode", "true");
    }
    formData.set("requestToken", options?.requestToken ?? "");
    if (options?.captchaToken) {
      formData.set("captchaToken", options.captchaToken);
    }
    formData.set("logInId", data.logInId);
    formData.set("password", data.password);
    formData.set("nickname", data.nickname);
    formData.set("region", data.region);
    formData.set("regionLegalDong", data.regionLegalDong);

    const terms =
      "terms" in data && data.terms
        ? data.terms
        : {
            service: false,
            privacy: false,
            marketingEmail: false,
            marketingSms: false,
          };
    formData.set("termService", String(terms.service));
    formData.set("termPrivacy", String(terms.privacy));
    formData.set("termEmail", String(terms.marketingEmail));
    formData.set("termSms", String(terms.marketingSms));

    if (!isResumeFlow && "passwordConfirm" in data) {
      formData.set("passwordConfirm", data.passwordConfirm);
      formData.set("email", data.email);
      formData.set("name", data.name);
      formData.set("phone", data.phone);
    }

    startTransition(() => {
      formAction(formData);
    });
  }

  return {
    control,
    getValues,
    setValue,
    setError,
    trigger,
    getFieldError,
    handleSubmit,
    submitToAction,
    state,
    isPending: uiState.isPending,
    submitDisabled: uiState.submitDisabled,
    showSubmitSpinner: uiState.showSubmitSpinner,
    isPartialSuccess,
    isResumeFlow,
    resumeMode,
    partialSuccessMessage: isPartialSuccess
      ? (state.message ?? SIGNUP_PARTIAL_SUCCESS_MESSAGE)
      : undefined,
    autoLoginFailedMessage,
    autoLoginFailed: uiState.autoLoginFailed,
    showPartialSuccessMessage: uiState.showPartialSuccessMessage,
    showAutoLoginFailedMessage: uiState.showAutoLoginFailedMessage,
    signupCompleted: autoLoginPhase === "success",
    goToMain,
  };
}
