"use server";

/**
 * 회원가입 Server Action.
 * zod 검증 후 service 호출 — apiFetch 직접 호출 금지(architecture-flow).
 */
import { redirect } from "next/navigation";

import { mapActionError } from "@/lib/auth/map-action-error";
import {
  checkEmailAvailabilityService,
  checkLoginIdAvailabilityService,
  signupService,
} from "@/services/auth.service";
import {
  signupSchema,
  type SignupFieldErrors,
  type SignupInput,
} from "@/types/auth/signup";

export type SignupActionState = {
  ok: boolean;
  message?: string;
  code?: string;
  fieldErrors?: SignupFieldErrors;
  values?: Pick<SignupInput, "logInId" | "email" | "name" | "phone">;
};

export async function signupAction(
  _prevState: SignupActionState,
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
  };

  const preserved = {
    logInId: values.logInId,
    email: values.email,
    name: values.name,
    phone: values.phone,
  };

  if (!requestToken) {
    return {
      ok: false,
      message: "본인인증을 먼저 완료해 주세요.",
      values: preserved,
    };
  }

  const parsed = signupSchema.safeParse(values);

  if (!parsed.success) {
    return {
      ok: false,
      message: "입력값을 확인해 주세요.",
      fieldErrors: parsed.error.flatten().fieldErrors,
      values: preserved,
    };
  }

  try {
    // name·phone은 UI 검증만 — auth API body에 포함하지 않음
    const { logInId, password, email } = parsed.data;
    await signupService({ requestToken, logInId, password, email });
  } catch (e) {
    return {
      ...mapActionError(e, "회원가입에 실패했습니다."),
      values: preserved,
    };
  }

  redirect("/signin");
}

export async function checkLoginIdAvailabilityAction(loginId: string) {
  const trimmed = loginId.trim();
  if (!trimmed) {
    return { ok: false, message: "아이디를 입력해 주세요." };
  }

  try {
    const available = await checkLoginIdAvailabilityService(trimmed);
    return {
      ok: true,
      available,
      message: available
        ? "사용 가능한 아이디입니다."
        : "이미 사용 중인 아이디입니다.",
    };
  } catch (e) {
    return mapActionError(e, "아이디 중복 확인에 실패했습니다.");
  }
}

export async function checkEmailAvailabilityAction(email: string) {
  const trimmed = email.trim();
  if (!trimmed) {
    return { ok: false, message: "이메일을 입력해 주세요." };
  }

  try {
    const available = await checkEmailAvailabilityService(trimmed);
    return {
      ok: true,
      available,
      message: available
        ? "사용 가능한 이메일입니다."
        : "이미 사용 중인 이메일입니다.",
    };
  } catch (e) {
    return mapActionError(e, "이메일 중복 확인에 실패했습니다.");
  }
}
