"use client";

import Link from "next/link";
import { Controller } from "react-hook-form";

import { Button } from "@/components/atoms/button";
import { Spinner } from "@/components/atoms/spinner";
import { GenderToggle } from "@/components/molecules/GenderToggle";
import { AddressSearchField } from "@/components/molecules/AddressSearchField";
import { RecaptchaWidget } from "@/components/molecules/RecaptchaWidget";
import { SigninInputField } from "@/components/molecules/SigninInputField";
import { SignupFieldWithAction } from "@/components/molecules/SignupFieldWithAction";
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
import { cn } from "@/lib/utils";
import {
  PASSWORD_HINT,
  type SignupFormInput,
  type SignupResumeFormInput,
} from "@/types/auth/signup";

const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? "";

function formatPhoneDisplay(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  }
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
}

type SignupFormProps = {
  resumeMode?: boolean;
};

export function SignupForm({ resumeMode = false }: SignupFormProps) {
  const {
    control,
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
  } = useSignupForm({ resumeMode });

  const {
    loginIdCheck,
    emailCheck,
    nicknameCheck,
    isCheckingLoginId,
    isCheckingEmail,
    isCheckingNickname,
    checkLoginId,
    checkEmail,
    checkNickname,
    clearLoginIdCheck,
    clearEmailCheck,
    clearNicknameCheck,
    verifyLoginId,
    verifyEmail,
    verifyNickname,
  } = useAvailabilityCheck();

  const {
    requestToken,
    identityMessage,
    gender,
    isVerifying,
    isIdentityVerified,
    handleIdentityVerification,
    setIdentityMessage,
  } = useIdentityVerification((prefill) => {
    setValue("name" as keyof SignupFormInput, prefill.name);
    setValue("phone" as keyof SignupFormInput, prefill.phone);
  });

  const {
    captchaRequired,
    captchaToken,
    captchaMessage,
    captchaExpiredMessage,
    captchaKey,
    handleCaptchaChange,
    handleCaptchaExpired,
    handleCaptchaLoadError,
    setCaptchaCompletionRequired,
  } = useSignupCaptcha({
    code: state.code,
    message: state.message,
    retryAfterSeconds: state.retryAfterSeconds,
  });

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

  function onSubmit(data: SignupFormInput | SignupResumeFormInput) {
    if (!isResumeFlow && !requestToken) {
      setIdentityMessage("본인인증을 먼저 완료해 주세요.");
      return;
    }

    if (isResumeFlow && captchaRequired && !captchaToken) {
      setCaptchaCompletionRequired();
      return;
    }

    const loginIdError = isResumeFlow ? undefined : verifyLoginId(data.logInId);
    const emailError =
      isResumeFlow || !("email" in data) ? undefined : verifyEmail(data.email);
    const nicknameError = verifyNickname(data.nickname);

    if (loginIdError) {
      setError("logInId", { type: "manual", message: loginIdError });
    }
    if (emailError) {
      setError("email" as keyof SignupFormInput, {
        type: "manual",
        message: emailError,
      });
    }
    if (nicknameError) {
      setError("nickname", { type: "manual", message: nicknameError });
    }
    if (loginIdError || emailError || nicknameError) return;

    submitToAction(data, {
      requestToken: isResumeFlow ? undefined : requestToken,
      captchaToken: isResumeFlow ? captchaToken : undefined,
    });
  }

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

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex w-full flex-col gap-6"
      noValidate
    >
      <div className="flex flex-col gap-5">
        {!isResumeFlow ? (
          <>
            <div className="flex flex-col gap-2">
              <div className="flex items-end justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <label
                    htmlFor="name"
                    className="text-sm font-medium text-vh-gray-500"
                  >
                    이름
                  </label>
                  <Controller
                    control={control}
                    name={"name" as keyof SignupFormInput}
                    render={({ field }) => (
                      <input
                        id="name"
                        value={field.value as string}
                        readOnly
                        placeholder="본인인증 후 자동 입력"
                        className={cn(
                          "mt-2 h-10 w-full border-b border-vh-gray-100 bg-transparent text-base text-vh-gray-100 outline-none",
                          "placeholder:text-vh-gray-700 md:text-sm",
                          isIdentityVerified && "text-vh-gray-500"
                        )}
                      />
                    )}
                  />
                </div>
                <GenderToggle
                  value={gender}
                  disabled={submitDisabled}
                  readOnly
                  className="pb-2"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="phone-display"
                className="text-sm font-medium text-vh-gray-500"
              >
                휴대폰
              </label>
              <div className="flex items-end gap-3">
                <div className="min-w-0 flex-1 border-b border-vh-gray-100">
                  <Controller
                    control={control}
                    name={"phone" as keyof SignupFormInput}
                    render={({ field }) => (
                      <input
                        id="phone-display"
                        readOnly
                        value={formatPhoneDisplay(String(field.value ?? ""))}
                        placeholder="010-1234-5678"
                        className="h-10 min-w-0 w-full bg-transparent py-1 text-base text-vh-gray-100 outline-none placeholder:text-vh-gray-700 md:text-sm"
                      />
                    )}
                  />
                </div>
                <Button
                  type="button"
                  variant="brand"
                  size="sm"
                  className="mb-1 shrink-0 rounded-sm px-3 py-1 text-xs"
                  disabled={submitDisabled || isPartialSuccess}
                  aria-busy={isVerifying}
                  onClick={handleIdentityVerification}
                >
                  {isIdentityVerified || isPartialSuccess ? (
                    "인증완료"
                  ) : isVerifying ? (
                    <Spinner size="sm" label="인증 중" inline />
                  ) : (
                    "본인인증"
                  )}
                </Button>
              </div>
              {identityMessage ? (
                <p
                  className={cn(
                    "text-xs",
                    isIdentityVerified ? "text-vh-gold-500" : "text-destructive"
                  )}
                  role="status"
                >
                  {identityMessage}
                </p>
              ) : null}
            </div>
          </>
        ) : null}

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
              actionPending={isCheckingLoginId}
              actionDisabled={!field.value.trim() || isResumeFlow}
              actionHidden={isResumeFlow}
              actionMessage={isResumeFlow ? undefined : loginIdCheck.message}
              actionTone={loginIdCheck.tone}
              onAction={() => checkLoginId(field.value)}
              onChange={(value) => {
                field.onChange(value);
                clearLoginIdCheck();
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
              autoComplete={isResumeFlow ? "current-password" : "new-password"}
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
          name="nickname"
          render={({ field }) => {
            const nicknameError = getFieldError("nickname");
            return (
              <SignupFieldWithAction
                label="닉네임"
                name="nickname"
                required
                value={field.value}
                disabled={submitDisabled}
                error={nicknameError}
                hint={nicknameError ? undefined : "한글 2-10자"}
                actionLabel="중복확인"
                actionPending={isCheckingNickname}
                actionDisabled={!field.value.trim()}
                actionMessage={
                  nicknameError ? undefined : nicknameCheck.message
                }
                actionTone={nicknameCheck.tone}
                onAction={() => checkNickname(field.value)}
                onChange={(value) => {
                  field.onChange(value);
                  clearNicknameCheck();
                }}
              />
            );
          }}
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
                type="text"
                inputMode="email"
                value={field.value as string}
                disabled={submitDisabled}
                error={getFieldError("email")}
                actionLabel="중복확인"
                actionPending={isCheckingEmail}
                actionDisabled={!String(field.value ?? "").trim()}
                actionMessage={emailCheck.message}
                actionTone={emailCheck.tone}
                onAction={() => checkEmail(String(field.value ?? ""))}
                onChange={(value) => {
                  field.onChange(value);
                  clearEmailCheck();
                }}
                autoComplete="off"
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
      </div>

      <Controller
        control={control}
        name={"terms" as keyof SignupFormInput}
        render={({ field }) => (
          <TermsAgreementSection
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
            onChange={field.onChange}
            error={getFieldError("terms")}
          />
        )}
      />

      {isResumeFlow && captchaRequired && recaptchaSiteKey ? (
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

      {isResumeFlow && captchaRequired && !recaptchaSiteKey ? (
        <p className="text-center text-sm text-destructive" role="alert">
          보안 확인을 표시할 수 없습니다.
        </p>
      ) : null}

      {showGenericError ? (
        <p className="text-center text-sm text-destructive" role="status">
          {state.message}
        </p>
      ) : null}

      {showLoginPolicyError && resumeError ? (
        <p
          className="text-center text-sm whitespace-pre-line text-destructive"
          role="status"
        >
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
          <p className="mt-2">
            <Link
              href="/signin"
              className="text-vh-gold-500 underline-offset-4 hover:underline"
            >
              로그인 페이지
            </Link>
          </p>
        </div>
      ) : null}

      <Button
        type="submit"
        variant="brand"
        className="h-12 w-full rounded-sm text-base"
        disabled={submitDisabled}
        aria-busy={showSubmitSpinner}
      >
        {showSubmitSpinner ? (
          <Spinner size="sm" label="가입 중" inline />
        ) : isResumeFlow ? (
          "가입 이어서 완료"
        ) : (
          "회원가입"
        )}
      </Button>

      <p className="text-center text-sm text-vh-gray-500">
        {resumeMode ? (
          <>
            신규 가입이 필요하신가요?{" "}
            <Link
              href="/signup"
              className="text-vh-gold-500 underline-offset-4 hover:underline"
            >
              회원가입
            </Link>
          </>
        ) : (
          <>
            이미 계정이 있으신가요?{" "}
            <Link
              href="/signin"
              className="text-vh-gold-500 underline-offset-4 hover:underline"
            >
              로그인
            </Link>
            {" · "}
            <Link
              href="/signup?mode=resume"
              className="text-vh-gold-500 underline-offset-4 hover:underline"
            >
              가입 이어서 완료
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
