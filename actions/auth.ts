"use server";

import { mapActionError } from "@/lib/auth/map-action-error";
import { mapSignupError } from "@/lib/auth/map-signup-error";
import { requireActionAuth } from "@/lib/session";
import {
  checkEmailAvailabilityService,
  checkLoginIdAvailabilityService,
  resumeSignupService,
  signupService,
  withdrawMemberService,
} from "@/services/auth.service";
import {
  checkNicknameAvailabilityService,
  createMemberService,
} from "@/services/member.service";
import {
  parseTermsFromFormData,
  signupOrchestrationSchema,
  signupResumeOrchestrationSchema,
  toTermConsents,
  type SignupFieldErrors,
  type SignupOrchestrationInput,
  type SignupResumeOrchestrationInput,
} from "@/types/auth/signup";

export type SignupActionState = {
  ok: boolean;
  autoLoginRequired?: boolean;
  partialSuccess?: boolean;
  message?: string;
  code?: string;
  retryAfterSeconds?: number;
  fieldErrors?: SignupFieldErrors;
  values?: Partial<
    Pick<
      SignupOrchestrationInput & SignupResumeOrchestrationInput,
      | "logInId"
      | "email"
      | "name"
      | "phone"
      | "nickname"
      | "region"
      | "regionLegalDong"
    >
  >;
};

function preservedFromForm(formData: FormData) {
  return {
    logInId: String(formData.get("logInId") ?? ""),
    email: String(formData.get("email") ?? ""),
    name: String(formData.get("name") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    nickname: String(formData.get("nickname") ?? ""),
    region: String(formData.get("region") ?? ""),
    regionLegalDong: String(formData.get("regionLegalDong") ?? ""),
  };
}

export async function signupAction(
  previousState: SignupActionState,
  formData: FormData
): Promise<SignupActionState> {
  const resumeMode = formData.get("resumeMode") === "true";
  const isResume = resumeMode || Boolean(previousState.partialSuccess);
  const requestToken = String(formData.get("requestToken") ?? "").trim();
  const captchaToken = String(formData.get("captchaToken") ?? "").trim();
  const preserved = preservedFromForm(formData);

  if (isResume) {
    const terms = parseTermsFromFormData(formData);
    const resumeValues = {
      logInId: preserved.logInId,
      password: String(formData.get("password") ?? ""),
      nickname: preserved.nickname,
      region: preserved.region,
      regionLegalDong: preserved.regionLegalDong,
      terms,
    };
    const parsed = signupResumeOrchestrationSchema.safeParse(resumeValues);
    if (!parsed.success) {
      return {
        ok: false,
        partialSuccess: true,
        message: "입력값을 확인해 주세요.",
        fieldErrors: parsed.error.flatten().fieldErrors,
        values: {
          logInId: preserved.logInId,
          nickname: preserved.nickname,
          region: preserved.region,
          regionLegalDong: preserved.regionLegalDong,
        },
      };
    }

    let authStepSucceeded = false;
    try {
      const {
        logInId,
        password,
        nickname,
        regionLegalDong,
        terms: parsedTerms,
      } = parsed.data;
      const authResult = await resumeSignupService({
        logInId,
        password,
        ...(captchaToken ? { captchaToken } : {}),
      });
      authStepSucceeded = true;

      if (!authResult.signupCompletionToken) {
        return {
          ok: false,
          partialSuccess: true,
          code: "SIGNUP_COMPLETION_TOKEN_MISSING",
          message:
            "회원가입 처리 구성이 아직 반영되지 않았습니다. 잠시 후 가입을 이어서 완료해 주세요.",
          values: {
            logInId: preserved.logInId,
            nickname: preserved.nickname,
            region: preserved.region,
            regionLegalDong: preserved.regionLegalDong,
          },
        };
      }

      await createMemberService(
        {
          memberUuid: authResult.authUuid,
          nickname,
          address: regionLegalDong,
          termConsents: toTermConsents(parsedTerms),
        },
        { completionToken: authResult.signupCompletionToken }
      );

      return { ok: true, autoLoginRequired: true };
    } catch (error) {
      return {
        ...mapSignupError(
          error,
          {
            authStepSucceeded,
            keepPartialSuccess: true,
          },
          "가입 이어서 완료에 실패했습니다."
        ),
        values: {
          logInId: preserved.logInId,
          nickname: preserved.nickname,
          region: preserved.region,
          regionLegalDong: preserved.regionLegalDong,
        },
      };
    }
  }

  const terms = parseTermsFromFormData(formData);
  const values = {
    logInId: preserved.logInId,
    password: String(formData.get("password") ?? ""),
    passwordConfirm: String(formData.get("passwordConfirm") ?? ""),
    email: preserved.email,
    name: preserved.name,
    phone: preserved.phone,
    nickname: preserved.nickname,
    region: preserved.region,
    regionLegalDong: preserved.regionLegalDong,
    terms,
  };
  const parsed = signupOrchestrationSchema.safeParse(values);
  if (!parsed.success) {
    return {
      ok: false,
      message: "입력값을 확인해 주세요.",
      fieldErrors: parsed.error.flatten().fieldErrors,
      values: preserved,
    };
  }
  if (!requestToken) {
    return {
      ok: false,
      message: "본인인증을 먼저 완료해 주세요.",
      values: preserved,
    };
  }

  let authStepSucceeded = false;
  try {
    const {
      logInId,
      password,
      email,
      nickname,
      regionLegalDong,
      terms: parsedTerms,
    } = parsed.data;
    const authResult = await signupService({
      requestToken,
      logInId,
      password,
      email,
    });
    authStepSucceeded = true;

    if (!authResult.signupCompletionToken) {
      return {
        ok: false,
        partialSuccess: true,
        code: "SIGNUP_COMPLETION_TOKEN_MISSING",
        message:
          "회원가입 처리 구성이 아직 반영되지 않았습니다. 잠시 후 가입을 이어서 완료해 주세요.",
        values: preserved,
      };
    }

    await createMemberService(
      {
        memberUuid: authResult.authUuid,
        nickname,
        address: regionLegalDong,
        termConsents: toTermConsents(parsedTerms),
      },
      { completionToken: authResult.signupCompletionToken }
    );

    return { ok: true, autoLoginRequired: true };
  } catch (error) {
    return {
      ...mapSignupError(
        error,
        {
          authStepSucceeded,
          keepPartialSuccess: authStepSucceeded,
        },
        "회원가입에 실패했습니다."
      ),
      values: preserved,
    };
  }
}

export async function checkLoginIdAvailabilityAction(loginId: string) {
  const value = loginId.trim();
  if (!value) return { ok: false, message: "아이디를 입력해 주세요." };
  try {
    const available = await checkLoginIdAvailabilityService(value);
    return {
      ok: true,
      available,
      message: available
        ? "사용 가능한 아이디입니다."
        : "이미 사용 중인 아이디입니다.",
    };
  } catch (error) {
    return mapActionError(error, "아이디 중복 확인에 실패했습니다.");
  }
}

export async function checkEmailAvailabilityAction(email: string) {
  const value = email.trim();
  if (!value) return { ok: false, message: "이메일을 입력해 주세요." };
  try {
    const available = await checkEmailAvailabilityService(value);
    return {
      ok: true,
      available,
      message: available
        ? "사용 가능한 이메일입니다."
        : "이미 사용 중인 이메일입니다.",
    };
  } catch (error) {
    return mapActionError(error, "이메일 중복 확인에 실패했습니다.");
  }
}

export async function checkNicknameAvailabilityAction(nickname: string) {
  const value = nickname.trim();
  if (!value) return { ok: false, message: "닉네임을 입력해 주세요." };
  try {
    const available = await checkNicknameAvailabilityService(value);
    return {
      ok: true,
      available,
      message: available
        ? "사용 가능한 닉네임입니다."
        : "이미 사용 중인 닉네임입니다.",
    };
  } catch (error) {
    return mapActionError(error, "닉네임 중복 확인에 실패했습니다.");
  }
}

export type WithdrawMemberActionResult =
  | { ok: true }
  | { ok: false; message: string };

/** PASS WITHDRAWAL confirm 후 회원 탈퇴 */
export async function withdrawMemberAction(
  requestToken: string
): Promise<WithdrawMemberActionResult> {
  const token = requestToken.trim();
  if (!token) {
    return { ok: false, message: "본인인증을 먼저 완료해 주세요." };
  }

  try {
    await requireActionAuth();
    await withdrawMemberService(token);
    return { ok: true };
  } catch (error) {
    return mapActionError(error, "회원 탈퇴에 실패했습니다.");
  }
}
