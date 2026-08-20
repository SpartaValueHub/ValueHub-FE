"use client";

import { useCallback, useReducer } from "react";

import { RECAPTCHA_EXPIRED_MESSAGE } from "@/components/molecules/auth/RecaptchaWidget";

type SigninCaptchaState = {
  required: boolean;
  token?: string;
  message?: string;
  expiredMessage?: string;
  resetKey: number;
};

type SigninCaptchaAction =
  | { type: "require" }
  | { type: "tokenChanged"; token?: string }
  | { type: "expired" }
  | { type: "loadFailed" }
  | { type: "completionRequired" }
  | { type: "authenticationFailed"; message: string }
  | { type: "messageChanged"; message?: string };

const initialState: SigninCaptchaState = {
  required: false,
  resetKey: 0,
};

function reducer(
  state: SigninCaptchaState,
  action: SigninCaptchaAction
): SigninCaptchaState {
  switch (action.type) {
    case "require":
      return { ...state, required: true };
    case "tokenChanged":
      return {
        ...state,
        token: action.token,
        ...(action.token
          ? { message: undefined, expiredMessage: undefined }
          : {}),
      };
    case "expired":
      return {
        ...state,
        token: undefined,
        expiredMessage: RECAPTCHA_EXPIRED_MESSAGE,
      };
    case "loadFailed":
      return {
        ...state,
        message: "보안 확인을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
      };
    case "completionRequired":
      return { ...state, message: "보안 확인을 완료해 주세요." };
    case "authenticationFailed":
      return {
        ...state,
        required: true,
        token: undefined,
        expiredMessage: undefined,
        message: action.message,
        resetKey: state.resetKey + 1,
      };
    case "messageChanged":
      return { ...state, message: action.message };
  }
}

export function useSigninCaptcha() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const requireCaptcha = useCallback(() => dispatch({ type: "require" }), []);
  const handleChange = useCallback(
    (token: string | undefined) => dispatch({ type: "tokenChanged", token }),
    []
  );
  const handleExpired = useCallback(() => dispatch({ type: "expired" }), []);
  const handleLoadError = useCallback(
    () => dispatch({ type: "loadFailed" }),
    []
  );
  const requireCompletion = useCallback(
    () => dispatch({ type: "completionRequired" }),
    []
  );
  const resetAfterFailure = useCallback(
    (message: string) => dispatch({ type: "authenticationFailed", message }),
    []
  );
  const setMessage = useCallback(
    (message?: string) => dispatch({ type: "messageChanged", message }),
    []
  );

  return {
    ...state,
    requireCaptcha,
    handleChange,
    handleExpired,
    handleLoadError,
    requireCompletion,
    resetAfterFailure,
    setMessage,
  };
}

export type SigninCaptchaController = ReturnType<typeof useSigninCaptcha>;
