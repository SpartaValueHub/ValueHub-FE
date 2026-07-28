"use server";

import { redirect } from "next/navigation";

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
    const { passwordConfirm: _, ...payload } = parsed.data;
    await signupService(payload);
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "회원가입에 실패했습니다.",
      values: preserved,
    };
  }

  redirect("/signin");
}
