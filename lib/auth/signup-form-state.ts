import type { SignupAutoLoginPhase } from "@/lib/auth/signup-auto-login";

export type SignupFormUiStateInput = {
  actionPending: boolean;
  autoLoginPhase: SignupAutoLoginPhase;
  partialSuccess: boolean;
};

export type SignupFormUiState = {
  isPending: boolean;
  submitDisabled: boolean;
  isPartialSuccess: boolean;
  autoLoginFailed: boolean;
  showSubmitSpinner: boolean;
  showPartialSuccessMessage: boolean;
  showAutoLoginFailedMessage: boolean;
};

/** Server Action·자동 로그인 진행 여부와 제출 가능 상태를 분리한다. */
export function resolveSignupFormUiState(
  input: SignupFormUiStateInput
): SignupFormUiState {
  const isAutoLoginPending = input.autoLoginPhase === "pending";
  const autoLoginFailed = input.autoLoginPhase === "failed";
  const isPartialSuccess = input.partialSuccess;
  const isPending = input.actionPending || isAutoLoginPending;
  const submitDisabled = isPending || autoLoginFailed;

  return {
    isPending,
    submitDisabled,
    isPartialSuccess,
    autoLoginFailed,
    showSubmitSpinner: isPending,
    showPartialSuccessMessage: isPartialSuccess && !isPending,
    showAutoLoginFailedMessage: autoLoginFailed && !isPending,
  };
}
