"use client";

import Link from "next/link";
import { useState } from "react";
import { Controller } from "react-hook-form";

import { Button } from "@/components/atoms/button";
import { Spinner } from "@/components/atoms/spinner";
import { AddressSearchField } from "@/components/molecules/AddressSearchField";
import { AlertDialog } from "@/components/molecules/AlertDialog";
import { RecaptchaWidget } from "@/components/molecules/RecaptchaWidget";
import { SigninInputField } from "@/components/molecules/SigninInputField";
import { SignupFieldWithAction } from "@/components/molecules/SignupFieldWithAction";
import { SignupIllustration } from "@/components/molecules/SignupIllustration";
import { SignupStepIndicator } from "@/components/molecules/SignupStepIndicator";
import { TermsAgreementSection } from "@/components/organisms/TermsAgreementSection";
import { useAvailabilityCheck } from "@/hooks/auth/useAvailabilityCheck";
import { useIdentityVerification } from "@/hooks/auth/useIdentityVerification";
import { useSignupCaptcha } from "@/hooks/auth/useSignupCaptcha";
import { useSignupForm } from "@/hooks/auth/useSignupForm";
import { SIGNUP_AUTO_LOGIN_FAILED_FOOTER } from "@/lib/auth/signup-auto-login";
import {
  isCaptchaRequiredError,
  parseSignInError,
  signInErrorMessage,
} from "@/lib/auth/signin-errors";
import {
  PASSWORD_HINT,
  type SignupFormInput,
  type SignupResumeFormInput,
} from "@/types/auth/signup";

const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? "";

type SignupFormProps = {
  resumeMode?: boolean;
  initialLoginId?: string;
};

const stepTitles = [
  "",
  "본인인증",
  "약관 동의",
  "회원정보 입력",
  "회원가입 완료",
];
const primaryButtonClass =
  "mt-8 h-[3.75rem] w-full max-w-[350px] self-center rounded-none border border-vh-gray-100 bg-transparent text-base text-vh-gray-100 hover:bg-vh-gray-100 hover:text-vh-gray-900";

export function SignupForm({
  resumeMode = false,
  initialLoginId,
}: SignupFormProps) {
  const [currentStep, setCurrentStep] = useState(resumeMode ? 2 : 1);
  const [termsStepError, setTermsStepError] = useState<string>();
  const [availabilityAlert, setAvailabilityAlert] = useState<string | null>(
    null
  );
  const {
    control,
    getValues,
    setValue,
    setError,
    getFieldError,
    handleSubmit,
    submitToAction,
    state,
    isPending,
    submitDisabled,
    showSubmitSpinner,
    isPartialSuccess,
    isResumeFlow,
    partialSuccessMessage,
    autoLoginFailedMessage,
    showPartialSuccessMessage,
    showAutoLoginFailedMessage,
    signupCompleted,
    goToMain,
  } = useSignupForm({ resumeMode, initialLoginId });

  const availability = useAvailabilityCheck();
  const identity = useIdentityVerification((prefill) => {
    setValue("name" as keyof SignupFormInput, prefill.name);
    setValue("phone" as keyof SignupFormInput, prefill.phone);
  });
  const captcha = useSignupCaptcha({
    code: state.code,
    message: state.message,
    retryAfterSeconds: state.retryAfterSeconds,
  });

  const displayedStep = signupCompleted
    ? 4
    : isPartialSuccess
      ? 3
      : currentStep;

  const resumeError = state.code
    ? parseSignInError(
        JSON.stringify({
          code: state.code,
          message: state.message,
          retryAfterSeconds: state.retryAfterSeconds,
        })
      )
    : undefined;
  const isLoginPolicyError = Boolean(
    resumeError &&
    [
      "AUTH_UNAUTHORIZED",
      "AUTH_CAPTCHA_REQUIRED",
      "AUTH_CAPTCHA_INVALID",
      "AUTH_CAPTCHA_PROVIDER_UNAVAILABLE",
      "AUTH_ACCOUNT_LOCKED",
      "AUTH_RATE_LIMITED",
      "AUTH_MEMBER_NOT_ACTIVE",
    ].includes(resumeError.code)
  );
  const showResumeBanner =
    showPartialSuccessMessage && !isLoginPolicyError && partialSuccessMessage;
  const showLoginPolicyError =
    !isPending &&
    isLoginPolicyError &&
    resumeError &&
    !isCaptchaRequiredError(resumeError) &&
    resumeError.code !== "AUTH_CAPTCHA_INVALID";
  const showGenericError =
    !isPending &&
    state.message &&
    !showResumeBanner &&
    !isLoginPolicyError &&
    !showAutoLoginFailedMessage;

  function goToTerms() {
    if (!identity.isIdentityVerified) {
      identity.setIdentityMessage("본인인증을 먼저 완료해 주세요.");
      return;
    }
    setCurrentStep(2);
  }

  function goToDetails() {
    const terms = getValues("terms");
    if (!terms?.service || !terms?.privacy) {
      setTermsStepError("필수 약관에 동의해 주세요.");
      setError("terms", {
        type: "manual",
        message: "필수 약관에 동의해 주세요.",
      });
      return;
    }
    setTermsStepError(undefined);
    setCurrentStep(3);
  }

  function onSubmit(data: SignupFormInput | SignupResumeFormInput) {
    if (!isResumeFlow && !identity.requestToken) {
      identity.setIdentityMessage("본인인증을 먼저 완료해 주세요.");
      setCurrentStep(1);
      return;
    }
    if (isResumeFlow && captcha.captchaRequired && !captcha.captchaToken) {
      captcha.setCaptchaCompletionRequired();
      return;
    }

    const loginIdError = isResumeFlow
      ? undefined
      : availability.verifyLoginId(data.logInId);
    const emailError =
      isResumeFlow || !("email" in data)
        ? undefined
        : availability.verifyEmail(data.email);
    const nicknameError = availability.verifyNickname(data.nickname);
    if (loginIdError)
      setError("logInId", { type: "manual", message: loginIdError });
    if (emailError)
      setError("email" as keyof SignupFormInput, {
        type: "manual",
        message: emailError,
      });
    if (nicknameError)
      setError("nickname", { type: "manual", message: nicknameError });
    if (loginIdError || emailError || nicknameError) {
      setAvailabilityAlert(loginIdError ?? emailError ?? nicknameError ?? null);
      return;
    }

    submitToAction(data, {
      requestToken: isResumeFlow ? undefined : identity.requestToken,
      captchaToken: isResumeFlow ? captcha.captchaToken : undefined,
    });
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mx-auto flex w-full flex-col items-center gap-9"
      noValidate
    >
      <SignupStepIndicator currentStep={displayedStep} />
      <h2 className="text-center text-lg font-medium text-vh-gray-100">
        {stepTitles[displayedStep]}
      </h2>

      {displayedStep === 1 ? (
        <section className="flex min-h-[28rem] w-full flex-col items-center gap-8 pt-8 text-center">
          <SignupIllustration variant="identity" />
          <p className="max-w-[420px] text-sm leading-6 text-vh-gray-300">
            {identity.isIdentityVerified
              ? "본인인증이 완료되었습니다."
              : "회원 식별과 중복가입 방지를 위해 본인인증을 먼저 진행해 주세요."}
          </p>
          {identity.identityMessage && !identity.isIdentityVerified ? (
            <p className="text-sm text-destructive" role="alert">
              {identity.identityMessage}
            </p>
          ) : null}
          <Button
            type="button"
            className={primaryButtonClass}
            disabled={identity.isVerifying}
            onClick={
              identity.isIdentityVerified
                ? goToTerms
                : identity.handleIdentityVerification
            }
          >
            {identity.isVerifying ? (
              <Spinner size="sm" label="본인인증 중" inline />
            ) : identity.isIdentityVerified ? (
              "다음"
            ) : (
              "본인인증하기"
            )}
          </Button>
        </section>
      ) : null}

      {displayedStep === 2 ? (
        <section className="flex min-h-[28rem] w-full flex-col items-center gap-10 pt-8">
          <p className="text-center text-sm text-vh-gray-300">
            회원가입 하시려면 약관에 동의해 주세요.
          </p>
          <Controller
            control={control}
            name={"terms" as keyof SignupFormInput}
            render={({ field }) => (
              <TermsAgreementSection
                className="w-full"
                value={
                  (field.value as SignupFormInput["terms"] | undefined) ?? {
                    all: false,
                    service: false,
                    privacy: false,
                    marketing: false,
                    marketingEmail: false,
                    marketingSms: false,
                  }
                }
                onChange={(value) => {
                  field.onChange(value);
                  setTermsStepError(undefined);
                }}
                error={termsStepError ?? getFieldError("terms")}
              />
            )}
          />
          <Button
            type="button"
            className={primaryButtonClass}
            onClick={goToDetails}
          >
            다음
          </Button>
        </section>
      ) : null}

      {displayedStep === 3 ? (
        <section className="flex w-full max-w-[480px] flex-col gap-5 self-center">
          <p className="mb-3 text-center text-sm text-vh-gray-300">
            회원정보를 입력해 주세요.
          </p>
          <Controller
            control={control}
            name="logInId"
            render={({ field }) => (
              <SignupFieldWithAction
                label="아이디"
                name="logInId"
                required
                value={field.value}
                disabled={submitDisabled}
                error={getFieldError("logInId")}
                hint="영소문자, 숫자 조합 4~20자리"
                actionLabel="중복확인"
                actionPending={availability.isCheckingLoginId}
                actionDisabled={!field.value.trim() || isResumeFlow}
                actionHidden={isResumeFlow}
                actionMessage={
                  isResumeFlow ? undefined : availability.loginIdCheck.message
                }
                actionTone={availability.loginIdCheck.tone}
                onAction={() => availability.checkLoginId(field.value)}
                onChange={(value) => {
                  field.onChange(value);
                  availability.clearLoginIdCheck();
                }}
                autoComplete="username"
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
                required
                type="password"
                value={field.value}
                disabled={submitDisabled}
                error={getFieldError("password")}
                autoComplete={
                  isResumeFlow ? "current-password" : "new-password"
                }
                onChange={field.onChange}
              />
            )}
          />
          {!getFieldError("password") && !isResumeFlow ? (
            <p className="-mt-3 text-xs text-vh-gray-500">{PASSWORD_HINT}</p>
          ) : null}
          {!isResumeFlow ? (
            <Controller
              control={control}
              name={"passwordConfirm" as keyof SignupFormInput}
              render={({ field }) => (
                <SigninInputField
                  label="비밀번호 확인"
                  name="passwordConfirm"
                  required
                  type="password"
                  value={field.value as string}
                  disabled={submitDisabled}
                  error={getFieldError("passwordConfirm")}
                  autoComplete="new-password"
                  onChange={field.onChange}
                />
              )}
            />
          ) : null}
          <Controller
            control={control}
            name="region"
            render={({ field }) => (
              <Controller
                control={control}
                name="regionLegalDong"
                render={({ field: legalDongField }) => (
                  <AddressSearchField
                    label="지역설정"
                    name="region"
                    value={field.value}
                    disabled={submitDisabled}
                    error={getFieldError("region")}
                    required
                    onChange={field.onChange}
                    onLegalDongChange={legalDongField.onChange}
                  />
                )}
              />
            )}
          />
          {!isResumeFlow ? (
            <Controller
              control={control}
              name={"email" as keyof SignupFormInput}
              render={({ field }) => (
                <SignupFieldWithAction
                  label="이메일"
                  name="email"
                  required
                  inputMode="email"
                  value={field.value as string}
                  disabled={submitDisabled}
                  error={getFieldError("email")}
                  actionLabel="중복확인"
                  actionPending={availability.isCheckingEmail}
                  actionDisabled={!String(field.value ?? "").trim()}
                  actionMessage={availability.emailCheck.message}
                  actionTone={availability.emailCheck.tone}
                  onAction={() =>
                    availability.checkEmail(String(field.value ?? ""))
                  }
                  onChange={(value) => {
                    field.onChange(value);
                    availability.clearEmailCheck();
                  }}
                  autoComplete="off"
                />
              )}
            />
          ) : null}
          <Controller
            control={control}
            name="nickname"
            render={({ field }) => (
              <SignupFieldWithAction
                label="닉네임"
                name="nickname"
                required
                value={field.value}
                disabled={submitDisabled}
                error={getFieldError("nickname")}
                hint={getFieldError("nickname") ? undefined : "한글 2~10자"}
                actionLabel="중복확인"
                actionPending={availability.isCheckingNickname}
                actionDisabled={!field.value.trim()}
                actionMessage={availability.nicknameCheck.message}
                actionTone={availability.nicknameCheck.tone}
                onAction={() => availability.checkNickname(field.value)}
                onChange={(value) => {
                  field.onChange(value);
                  availability.clearNicknameCheck();
                }}
              />
            )}
          />

          {isResumeFlow && captcha.captchaRequired && recaptchaSiteKey ? (
            <div className="flex flex-col items-center gap-2">
              <RecaptchaWidget
                key={captcha.captchaKey}
                siteKey={recaptchaSiteKey}
                onChange={captcha.handleCaptchaChange}
                onExpired={captcha.handleCaptchaExpired}
                onLoadError={captcha.handleCaptchaLoadError}
                expiredMessage={captcha.captchaExpiredMessage}
              />
              {captcha.captchaMessage ? (
                <p className="text-center text-sm text-destructive">
                  {captcha.captchaMessage}
                </p>
              ) : null}
            </div>
          ) : null}
          {isResumeFlow && captcha.captchaRequired && !recaptchaSiteKey ? (
            <p className="text-center text-sm text-destructive">
              보안 확인을 표시할 수 없습니다.
            </p>
          ) : null}
          {showGenericError ? (
            <p className="text-center text-sm text-destructive">
              {state.message}
            </p>
          ) : null}
          {showLoginPolicyError && resumeError ? (
            <p className="text-center text-sm whitespace-pre-line text-destructive">
              {signInErrorMessage(resumeError)}
            </p>
          ) : null}
          {showResumeBanner ? (
            <div className="text-center text-sm text-vh-gray-500" role="status">
              <p>{partialSuccessMessage}</p>
              <p className="mt-2">
                비밀번호와 프로필 정보를 확인한 뒤 가입을 이어서 완료해 주세요.
              </p>
            </div>
          ) : null}
          {showAutoLoginFailedMessage && autoLoginFailedMessage ? (
            <div className="text-center text-sm text-vh-gray-500" role="status">
              <p>{autoLoginFailedMessage}</p>
              <p className="mt-2">{SIGNUP_AUTO_LOGIN_FAILED_FOOTER}</p>
              <Link
                href="/signin"
                className="mt-2 inline-block text-vh-gold-500 hover:underline"
              >
                로그인 페이지
              </Link>
            </div>
          ) : null}
          <Button
            type="submit"
            className={primaryButtonClass}
            disabled={submitDisabled}
            aria-busy={showSubmitSpinner}
          >
            {showSubmitSpinner ? (
              <Spinner size="sm" label="가입 처리 중" inline />
            ) : (
              "다음"
            )}
          </Button>
        </section>
      ) : null}

      {displayedStep === 4 ? (
        <section className="flex min-h-[28rem] w-full flex-col items-center gap-8 pt-8 text-center">
          <SignupIllustration variant="complete" />
          <div className="space-y-2 text-sm text-vh-gray-300">
            <p>Value Hub 회원가입이 완료되었습니다.</p>
            <p>이제 다양한 서비스를 이용해 보세요.</p>
          </div>
          <Button
            type="button"
            className={primaryButtonClass}
            onClick={goToMain}
          >
            메인으로 이동
          </Button>
        </section>
      ) : null}

      <AlertDialog
        open={availabilityAlert !== null}
        onOpenChange={(next) => {
          if (!next) setAvailabilityAlert(null);
        }}
        primaryLabel="확인"
        onPrimary={() => setAvailabilityAlert(null)}
        secondaryLabel="취소"
        onSecondary={() => setAvailabilityAlert(null)}
      >
        {availabilityAlert ?? ""}
      </AlertDialog>
    </form>
  );
}
