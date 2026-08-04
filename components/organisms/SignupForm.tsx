"use client";

import Link from "next/link";
import {
  useActionState,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";

import {
  checkEmailAvailabilityAction,
  checkLoginIdAvailabilityAction,
  signupAction,
  type SignupActionState,
} from "@/actions/auth";
import { confirmIdentityVerificationAction } from "@/actions/identity-verification";
import { Button } from "@/components/atoms/button";
import {
  GenderToggle,
  type GenderOption,
} from "@/components/molecules/GenderToggle";
import { SigninInputField } from "@/components/molecules/SigninInputField";
import { SignupFieldWithAction } from "@/components/molecules/SignupFieldWithAction";
import {
  initialTerms,
  TermsAgreementSection,
  type TermsState,
} from "@/components/organisms/TermsAgreementSection";
import { cn } from "@/lib/utils";
import {
  emptySignupValues,
  getSignupFieldErrors,
  type SignupFieldErrors,
  type SignupInput,
} from "@/types/auth/signup";
import type { ApiGender } from "@/types/auth/api";
import { v4 as uuidv4 } from "uuid";

const initialState: SignupActionState = { ok: false };

type TouchedFields = Partial<Record<keyof SignupInput, boolean>>;

function formatPhoneDisplay(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  }
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
}

function mapApiGender(gender?: ApiGender): GenderOption | undefined {
  if (gender === "MALE") return "male";
  if (gender === "FEMALE") return "female";
  return undefined;
}

export function SignupForm() {
  const [state, formAction, isPending] = useActionState(
    signupAction,
    initialState
  );
  const [values, setValues] = useState<SignupInput>(emptySignupValues);
  const [touched, setTouched] = useState<TouchedFields>({});
  const [requestToken, setRequestToken] = useState("");
  const [identityMessage, setIdentityMessage] = useState<string>();
  const [isVerifying, startVerifyTransition] = useTransition();
  const [gender, setGender] = useState<GenderOption | undefined>(undefined);
  const [region, setRegion] = useState("");
  const [nickname, setNickname] = useState("");
  const [terms, setTerms] = useState<TermsState>(initialTerms);
  const [termsError, setTermsError] = useState<string>();
  const [loginIdCheck, setLoginIdCheck] = useState<{
    message?: string;
    tone?: "success" | "error";
  }>({});
  const [emailCheck, setEmailCheck] = useState<{
    message?: string;
    tone?: "success" | "error";
  }>({});
  const [isCheckingLoginId, startLoginIdCheck] = useTransition();
  const [isCheckingEmail, startEmailCheck] = useTransition();

  useEffect(() => {
    if (!state.values) return;
    const frameId = requestAnimationFrame(() => {
      setValues((prev) => ({
        ...prev,
        ...state.values,
      }));
    });
    return () => cancelAnimationFrame(frameId);
  }, [state.values]);

  const realtimeErrors = useMemo(() => getSignupFieldErrors(values), [values]);

  const fieldErrors = useMemo(() => {
    const next: SignupFieldErrors = {};
    (Object.keys(values) as (keyof SignupInput)[]).forEach((key) => {
      if (!touched[key] && !state.fieldErrors?.[key]) return;
      next[key] = state.fieldErrors?.[key] ?? realtimeErrors[key];
    });
    return next;
  }, [realtimeErrors, state.fieldErrors, touched, values]);

  const isIdentityVerified = Boolean(requestToken);

  function updateField(name: keyof SignupInput, value: string) {
    setValues((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));
    if (name === "logInId") setLoginIdCheck({});
    if (name === "email") setEmailCheck({});
  }

  function handleIdentityVerification() {
    const storeId = process.env.NEXT_PUBLIC_PORTONE_STORE_ID?.trim();
    const channelKey = process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY?.trim();
    if (!storeId || !channelKey) {
      setIdentityMessage("PortOne Store ID·Channel Key를 설정해 주세요.");
      return;
    }

    startVerifyTransition(async () => {
      setIdentityMessage(undefined);
      try {
        const { requestIdentityVerification } =
          await import("@portone/browser-sdk/v2");
        const identityVerificationId = `identity-verification-${uuidv4()}`;
        const response = await requestIdentityVerification({
          storeId,
          channelKey,
          identityVerificationId,
        });

        if (!response) {
          setIdentityMessage("본인인증 응답이 없습니다.");
          return;
        }

        if (response.code !== undefined) {
          setIdentityMessage(response.message ?? "본인인증에 실패했습니다.");
          return;
        }

        const confirmResult = await confirmIdentityVerificationAction(
          response.identityVerificationId ?? identityVerificationId
        );
        if (!confirmResult.ok) {
          setIdentityMessage(confirmResult.message);
          return;
        }

        const { data } = confirmResult;
        setRequestToken(data.requestToken);
        const verifiedGender = mapApiGender(data.gender);
        if (verifiedGender) {
          setGender(verifiedGender);
        }
        setValues((prev) => ({
          ...prev,
          name: data.memberName ?? prev.name,
          phone: data.phoneNumber?.replace(/\D/g, "") ?? prev.phone,
        }));
        setIdentityMessage("본인인증이 완료되었습니다.");
      } catch (error) {
        console.error("Identity verification failed:", error);
        setIdentityMessage("본인인증 처리 중 오류가 발생했습니다.");
      }
    });
  }

  function handleCheckLoginId() {
    startLoginIdCheck(async () => {
      const result = await checkLoginIdAvailabilityAction(values.logInId);
      setLoginIdCheck({
        message: result.message,
        tone: result.ok && result.available ? "success" : "error",
      });
    });
  }

  function handleCheckEmail() {
    startEmailCheck(async () => {
      const result = await checkEmailAvailabilityAction(values.email);
      setEmailCheck({
        message: result.message,
        tone: result.ok && result.available ? "success" : "error",
      });
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    setTermsError(undefined);

    if (!terms.service || !terms.privacy) {
      event.preventDefault();
      setTermsError("필수 약관에 동의해 주세요.");
      return;
    }

    if (!requestToken) {
      event.preventDefault();
      setIdentityMessage("본인인증을 먼저 완료해 주세요.");
      return;
    }
  }

  return (
    <form
      action={formAction}
      onSubmit={handleSubmit}
      className="flex w-full flex-col gap-6"
      noValidate
    >
      <input type="hidden" name="requestToken" value={requestToken} />
      <input type="hidden" name="name" value={values.name} />
      <input type="hidden" name="phone" value={values.phone} />

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
              <input
                id="name"
                value={values.name}
                readOnly
                placeholder="본인인증 후 자동 입력"
                className={cn(
                  "mt-2 h-10 w-full border-b border-vh-gray-100 bg-transparent text-base text-vh-gray-100 outline-none",
                  "placeholder:text-vh-gray-700 md:text-sm",
                  isIdentityVerified && "text-vh-gray-500"
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
            <input
              id="phone-display"
              readOnly
              value={formatPhoneDisplay(values.phone)}
              placeholder="010-1234-5678"
              className="h-10 min-w-0 flex-1 bg-transparent py-1 text-base text-vh-gray-100 outline-none placeholder:text-vh-gray-700 md:text-sm"
            />
            <Button
              type="button"
              variant="brand"
              size="sm"
              className="mb-1 shrink-0 rounded-sm px-3 py-1 text-xs"
              disabled={isPending || isVerifying || isIdentityVerified}
              onClick={handleIdentityVerification}
            >
              {isIdentityVerified
                ? "인증완료"
                : isVerifying
                  ? "인증 중..."
                  : "본인인증"}
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

        <SignupFieldWithAction
          label="아이디"
          name="logInId"
          required
          value={values.logInId}
          disabled={isPending}
          error={fieldErrors.logInId?.[0]}
          hint="영소문자, 숫자 조합 4~20자리"
          actionLabel="중복확인"
          actionPending={isCheckingLoginId}
          actionDisabled={!values.logInId.trim()}
          actionMessage={loginIdCheck.message}
          actionTone={loginIdCheck.tone}
          onAction={handleCheckLoginId}
          onChange={(value) => updateField("logInId", value)}
          autoComplete="username"
        />

        <SigninInputField
          label="비밀번호*"
          name="password"
          type="password"
          value={values.password}
          disabled={isPending}
          error={fieldErrors.password?.[0]}
          autoComplete="new-password"
          onChange={(value) => updateField("password", value)}
        />
        {!fieldErrors.password?.[0] ? (
          <p className="-mt-3 text-xs text-vh-gray-500">
            특수문자 1개 이상을 포함한 영문, 숫자 조합 8~20자리
          </p>
        ) : null}

        <SigninInputField
          label="비밀번호 확인*"
          name="passwordConfirm"
          type="password"
          value={values.passwordConfirm}
          disabled={isPending}
          error={fieldErrors.passwordConfirm?.[0]}
          autoComplete="new-password"
          onChange={(value) => updateField("passwordConfirm", value)}
        />

        <SignupFieldWithAction
          label="닉네임"
          name="nickname"
          required
          value={nickname}
          disabled
          placeholder="member-service 연동 예정"
          hint="한글 2-10자"
          actionLabel="중복확인"
          actionDisabled
          onChange={setNickname}
        />

        <SignupFieldWithAction
          label="이메일"
          name="email"
          required
          type="text"
          inputMode="email"
          value={values.email}
          disabled={isPending}
          error={fieldErrors.email?.[0]}
          actionLabel="중복확인"
          actionPending={isCheckingEmail}
          actionDisabled={!values.email.trim()}
          actionMessage={emailCheck.message}
          actionTone={emailCheck.tone}
          onAction={handleCheckEmail}
          onChange={(value) => updateField("email", value)}
          autoComplete="off"
        />

        <SignupFieldWithAction
          label="주소"
          name="region"
          required
          value={region}
          disabled
          placeholder="주소 검색 (준비 중)"
          actionLabel="주소검색"
          actionDisabled
          onChange={setRegion}
        />
      </div>

      <TermsAgreementSection
        value={terms}
        onChange={setTerms}
        error={termsError}
      />

      {isPending ? (
        <p className="text-center text-sm text-vh-gold-500" role="status">
          회원가입 처리 중...
        </p>
      ) : state.message ? (
        <p className="text-center text-sm text-destructive" role="status">
          {state.message}
        </p>
      ) : null}

      <Button
        type="submit"
        variant="brand"
        className="h-12 w-full rounded-sm text-base"
        disabled={isPending}
      >
        {isPending ? "가입 중..." : "회원가입"}
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
