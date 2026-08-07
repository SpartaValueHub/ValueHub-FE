"use server";

import { mapActionError } from "@/lib/auth/map-action-error";
import { mapSignupError } from "@/lib/auth/map-signup-error";
import {
  checkEmailAvailabilityService,
  checkLoginIdAvailabilityService,
  resumeSignupService,
  signupService,
} from "@/services/auth.service";
import {
  checkNicknameAvailabilityService,
  createMemberService,
} from "@/services/member.service";
import {
  signupOrchestrationSchema,
  type SignupFieldErrors,
  type SignupOrchestrationInput,
} from "@/types/auth/signup";

export type SignupActionState = {
  ok: boolean;
  autoLoginRequired?: boolean;
  partialSuccess?: boolean;
  message?: string;
  code?: string;
  fieldErrors?: SignupFieldErrors;
  values?: Pick<
    SignupOrchestrationInput,
    | "logInId"
    | "email"
    | "name"
    | "phone"
    | "nickname"
    | "region"
    | "regionLegalDong"
  >;
};

export async function signupAction(
  previousState: SignupActionState,
  formData: FormData
): Promise<SignupActionState> {
  const requestToken = String(formData.get("requestToken") ?? "").trim();
  const values = {
    logInId: String(formData.get("logInId") ?? ""),
    password: String(formData.get("password") ?? ""),
    passwordConfirm: String(formData.get("passwordConfirm") ?? ""),
    email: String(formData.get("email") ?? ""),
    name: String(formData.get("name") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    nickname: String(formData.get("nickname") ?? ""),
    region: String(formData.get("region") ?? ""),
    regionLegalDong: String(formData.get("regionLegalDong") ?? ""),
  };
  const preserved = {
    logInId: values.logInId,
    email: values.email,
    name: values.name,
    phone: values.phone,
    nickname: values.nickname,
    region: values.region,
    regionLegalDong: values.regionLegalDong,
  };
  const parsed = signupOrchestrationSchema.safeParse(values);
  if (!parsed.success) {
    return {
      ok: false,
      partialSuccess: previousState.partialSuccess,
      message: "입력값을 확인해 주세요.",
      fieldErrors: parsed.error.flatten().fieldErrors,
      values: preserved,
    };
  }
  if (!previousState.partialSuccess && !requestToken) {
    return {
      ok: false,
      message: "본인인증을 먼저 완료해 주세요.",
      values: preserved,
    };
  }

  let authCreated = Boolean(previousState.partialSuccess);
  try {
    const { logInId, password, email, nickname, regionLegalDong } = parsed.data;
    const authResult = previousState.partialSuccess
      ? await resumeSignupService({ logInId, password })
      : await signupService({ requestToken, logInId, password, email });
    authCreated = true;
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
      },
      { completionToken: authResult.signupCompletionToken }
    );

    return { ok: true, autoLoginRequired: true };
  } catch (error) {
    return {
      ...mapSignupError(error, { authCreated }, "회원가입에 실패했습니다."),
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
