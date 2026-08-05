"use client";

import Link from "next/link";
import { Controller, useWatch } from "react-hook-form";

import { Button } from "@/components/atoms/button";
import { Spinner } from "@/components/atoms/spinner";
import { GenderToggle } from "@/components/molecules/GenderToggle";
import { SigninInputField } from "@/components/molecules/SigninInputField";
import { SignupFieldWithAction } from "@/components/molecules/SignupFieldWithAction";
import { TermsAgreementSection } from "@/components/organisms/TermsAgreementSection";
import { useAvailabilityCheck } from "@/hooks/auth/useAvailabilityCheck";
import { useIdentityVerification } from "@/hooks/auth/useIdentityVerification";
import { useSignupForm } from "@/hooks/auth/useSignupForm";
import { cn } from "@/lib/utils";
import type { SignupFormInput } from "@/types/auth/signup";

function formatPhoneDisplay(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  }
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
}

export function SignupForm() {
  const {
    control,
    setValue,
    setError,
    getFieldError,
    handleSubmit,
    submitToAction,
    state,
    isPending,
  } = useSignupForm();

  const terms = useWatch({ control, name: "terms" });
  const requiredTermsAccepted = Boolean(terms?.service && terms?.privacy);

  const {
    loginIdCheck,
    emailCheck,
    isCheckingLoginId,
    isCheckingEmail,
    checkLoginId,
    checkEmail,
    clearLoginIdCheck,
    clearEmailCheck,
    verifyLoginId,
    verifyEmail,
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
    setValue("name", prefill.name);
    setValue("phone", prefill.phone);
  });

  function onSubmit(data: SignupFormInput) {
    if (!requestToken) {
      setIdentityMessage("본인인증을 먼저 완료해 주세요.");
      return;
    }

    const loginIdError = verifyLoginId(data.logInId);
    const emailError = verifyEmail(data.email);

    if (loginIdError) {
      setError("logInId", { type: "manual", message: loginIdError });
    }
    if (emailError) {
      setError("email", { type: "manual", message: emailError });
    }
    if (loginIdError || emailError) return;

    submitToAction(data, requestToken);
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex w-full flex-col gap-6"
      noValidate
    >
      <div className="flex flex-col gap-5">
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
                name="name"
                render={({ field }) => (
                  <input
                    id="name"
                    value={field.value}
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
              disabled={isPending}
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
          <div className="flex items-end gap-3 border-b border-vh-gray-100">
            <Controller
              control={control}
              name="phone"
              render={({ field }) => (
                <input
                  id="phone-display"
                  readOnly
                  value={formatPhoneDisplay(field.value)}
                  placeholder="010-1234-5678"
                  className="h-10 min-w-0 flex-1 bg-transparent py-1 text-base text-vh-gray-100 outline-none placeholder:text-vh-gray-700 md:text-sm"
                />
              )}
            />
            <Button
              type="button"
              variant="brand"
              size="sm"
              className="mb-1 shrink-0 rounded-sm px-3 py-1 text-xs"
              disabled={isPending || isVerifying || isIdentityVerified}
              aria-busy={isVerifying}
              onClick={handleIdentityVerification}
            >
              {isIdentityVerified ? (
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

        <Controller
          control={control}
          name="logInId"
          render={({ field }) => (
            <SignupFieldWithAction
              label="아이디"
              name="logInId"
              required
              value={field.value}
              disabled={isPending}
              error={getFieldError("logInId")}
              hint="영소문자, 숫자 조합 4~20자리"
              actionLabel="중복확인"
              actionPending={isCheckingLoginId}
              actionDisabled={!field.value.trim()}
              actionMessage={loginIdCheck.message}
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
              label="비밀번호*"
              name="password"
              type="password"
              value={field.value}
              disabled={isPending}
              error={getFieldError("password")}
              autoComplete="new-password"
              onChange={field.onChange}
            />
          )}
        />
        {!getFieldError("password") ? (
          <p className="-mt-3 text-xs text-vh-gray-500">
            비밀번호는 8~20자, 영문
            대문자·소문자·숫자·특수문자(!@#$%^&*()-+_=)를 각각 1자 이상 포함해야
            합니다.
          </p>
        ) : null}

        <Controller
          control={control}
          name="passwordConfirm"
          render={({ field }) => (
            <SigninInputField
              label="비밀번호 확인*"
              name="passwordConfirm"
              type="password"
              value={field.value}
              disabled={isPending}
              error={getFieldError("passwordConfirm")}
              autoComplete="new-password"
              onChange={field.onChange}
            />
          )}
        />

        <Controller
          control={control}
          name="nickname"
          render={({ field }) => (
            <SignupFieldWithAction
              label="닉네임"
              name="nickname"
              required
              value={field.value}
              disabled
              placeholder="member-service 연동 예정"
              hint="한글 2-10자"
              actionLabel="중복확인"
              actionDisabled
              onChange={field.onChange}
            />
          )}
        />

        <Controller
          control={control}
          name="email"
          render={({ field }) => (
            <SignupFieldWithAction
              label="이메일"
              name="email"
              required
              type="text"
              inputMode="email"
              value={field.value}
              disabled={isPending}
              error={getFieldError("email")}
              actionLabel="중복확인"
              actionPending={isCheckingEmail}
              actionDisabled={!field.value.trim()}
              actionMessage={emailCheck.message}
              actionTone={emailCheck.tone}
              onAction={() => checkEmail(field.value)}
              onChange={(value) => {
                field.onChange(value);
                clearEmailCheck();
              }}
              autoComplete="off"
            />
          )}
        />

        <Controller
          control={control}
          name="region"
          render={({ field }) => (
            <SignupFieldWithAction
              label="주소"
              name="region"
              required
              value={field.value}
              disabled
              placeholder="주소 검색 (준비 중)"
              actionLabel="주소검색"
              actionDisabled
              onChange={field.onChange}
            />
          )}
        />
      </div>

      <Controller
        control={control}
        name="terms"
        render={({ field }) => (
          <TermsAgreementSection
            value={field.value}
            onChange={field.onChange}
            error={getFieldError("terms")}
          />
        )}
      />

      {!isPending && state.message ? (
        <p className="text-center text-sm text-destructive" role="status">
          {state.message}
        </p>
      ) : null}

      <Button
        type="submit"
        variant="brand"
        className="h-12 w-full rounded-sm text-base"
        disabled={isPending || !requiredTermsAccepted}
        aria-busy={isPending}
      >
        {isPending ? <Spinner size="sm" label="가입 중" inline /> : "회원가입"}
      </Button>

      <p className="text-center text-sm text-vh-gray-500">
        이미 계정이 있으신가요?{" "}
        <Link
          href="/signin"
          className="text-vh-gold-500 underline-offset-4 hover:underline"
        >
          로그인
        </Link>
      </p>
    </form>
  );
}
