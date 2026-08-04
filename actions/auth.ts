"use server";

/**
 * 회원가입 Server Action.
 * zod 검증 후 service 호출 — apiFetch 직접 호출 금지(architecture-flow).
 */
import { redirect } from "next/navigation";

import { ApiError } from "@/lib/api/client";
import { signupService } from "@/services/auth.service";
import {
  signupSchema,
  type SignupFieldErrors,
  type SignupInput,
} from "@/types/auth/signup";

export type SignupActionState = {
  ok: boolean;
  message?: string;
  fieldErrors?: SignupFieldErrors;
  values?: Pick<SignupInput, "logInId" | "email" | "name" | "phone">;
};

export async function signupAction(
  _prevState: SignupActionState,
  formData: FormData
): Promise<SignupActionState> {
  // PortOne confirm 후 SignupForm hidden field 로 전달 예정
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
    const message =
      e instanceof ApiError
        ? e.message
        : e instanceof Error
          ? e.message
          : "회원가입에 실패했습니다.";
    return {
      ok: false,
      message,
      values: preserved,
    };
  }

  redirect("/signin");
}
