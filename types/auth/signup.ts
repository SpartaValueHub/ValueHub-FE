import { z } from "zod";

// auth-service AuthDomain 검증 규칙과 동기화
const LOGIN_ID_PATTERN = /^[a-z0-9]{4,20}$/;
const PASSWORD_PATTERN =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-+_=])[A-Za-z\d!@#$%^&*()\-+_=]{8,20}$/;

/** auth-service sign-up API 로 전달하는 필드 */
export type SignupApiInput = {
  requestToken: string;
  logInId: string;
  password: string;
  email: string;
};

export const signupSchema = z
  .object({
    logInId: z
      .string()
      .regex(
        LOGIN_ID_PATTERN,
        "아이디는 영문 소문자와 숫자 조합 4~20자여야 합니다."
      ),
    password: z
      .string()
      .regex(
        PASSWORD_PATTERN,
        "비밀번호는 8~20자이며 영문 대소문자, 숫자, 특수문자(!@#$%^&*()-+_=)를 각각 1자 이상 포함해야 합니다."
      ),
    passwordConfirm: z.string().min(1, "비밀번호 확인을 입력해 주세요."),
    email: z
      .email({ error: "올바른 이메일 형식이 아닙니다." })
      .max(50, { error: "이메일은 50자 이하여야 합니다." }),
    /** UI 유지용 — API 미전송 (PortOne prefill 예정) */
    name: z
      .string()
      .min(2, "이름은 2자 이상이어야 합니다.")
      .max(20, "이름은 20자 이하여야 합니다."),
    /** UI 유지용 — API 미전송 (PortOne prefill 예정) */
    phone: z
      .string()
      .regex(/^01[016789]\d{7,8}$/, "휴대폰 번호 형식이 올바르지 않습니다."),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["passwordConfirm"],
  });

export type SignupInput = z.infer<typeof signupSchema>;

export type SignupFieldErrors = Partial<
  Record<keyof SignupInput, string[] | undefined>
>;

export const emptySignupValues: SignupInput = {
  logInId: "",
  password: "",
  passwordConfirm: "",
  email: "",
  name: "",
  phone: "",
};

export function getSignupFieldErrors(values: SignupInput): SignupFieldErrors {
  const parsed = signupSchema.safeParse(values);
  if (parsed.success) return {};
  return parsed.error.flatten().fieldErrors;
}
