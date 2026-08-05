import { z } from "zod";

// auth-service loginId 규칙과 동기화
export const signinSchema = z.object({
  logInId: z
    .string()
    .regex(
      /^[a-z0-9]{4,20}$/,
      "아이디는 영문 소문자와 숫자 조합 4~20자여야 합니다."
    ),
  password: z
    .string()
    .min(
      8,
      "비밀번호는 8~20자, 영문 대문자·소문자·숫자·특수문자(!@#$%^&*()-+_=)를 각각 1자 이상 포함해야 합니다."
    )
    .max(
      20,
      "비밀번호는 8~20자, 영문 대문자·소문자·숫자·특수문자(!@#$%^&*()-+_=)를 각각 1자 이상 포함해야 합니다."
    ),
});

export type SigninInput = z.infer<typeof signinSchema>;

export type SigninFieldErrors = Partial<
  Record<keyof SigninInput, string[] | undefined>
>;

export const emptySigninValues: SigninInput = {
  logInId: "",
  password: "",
};

export function getSigninFieldErrors(values: SigninInput): SigninFieldErrors {
  const parsed = signinSchema.safeParse(values);
  if (parsed.success) return {};
  return parsed.error.flatten().fieldErrors;
}
