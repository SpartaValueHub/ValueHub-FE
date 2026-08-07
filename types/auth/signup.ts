import { z } from "zod";

// auth-service AuthDomain 검증 규칙과 동기화
const LOGIN_ID_PATTERN = /^[a-z0-9]{4,20}$/;
const PASSWORD_PATTERN =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-+_=])[A-Za-z\d!@#$%^&*()\-+_=]{8,20}$/;

/** 비밀번호 입력란 하단 정적 안내 (짧게) */
export const PASSWORD_HINT = "8~20자, 영문 대·소문자, 숫자, 특수문자 포함";

/** Zod 검증 실패 시 표시 — auth-service와 동일 규칙, 허용 문자 목록은 UI에 노출하지 않음 */
export const PASSWORD_VALIDATION_MESSAGE =
  "비밀번호는 8~20자, 영문 대문자·소문자·숫자·특수문자를 각각 1자 이상 포함해야 합니다.";

const NICKNAME_PATTERN = /^[가-힣]{2,10}$/;

/** auth-service sign-up API 로 전달하는 필드 */
export type SignupApiInput = {
  requestToken: string;
  logInId: string;
  password: string;
  email: string;
};

const signupFieldsSchema = z.object({
  logInId: z
    .string()
    .regex(
      LOGIN_ID_PATTERN,
      "아이디는 영문 소문자와 숫자 조합 4~20자여야 합니다."
    ),
  password: z.string().regex(PASSWORD_PATTERN, PASSWORD_VALIDATION_MESSAGE),
  passwordConfirm: z.string().min(1, "비밀번호 확인을 입력해 주세요."),
  email: z
    .email({ error: "올바른 이메일 형식이 아닙니다." })
    .max(50, { error: "이메일은 50자 이하여야 합니다." }),
  /** UI 유지용 — API 미전송 */
  name: z
    .string()
    .min(2, "이름은 2자 이상이어야 합니다.")
    .max(20, "이름은 20자 이하여야 합니다."),
  /** UI 유지용 — API 미전송 */
  phone: z
    .string()
    .regex(/^01[016789]\d{7,8}$/, "휴대폰 번호 형식이 올바르지 않습니다."),
});

const passwordConfirmRefine = {
  message: "비밀번호가 일치하지 않습니다.",
  path: ["passwordConfirm"] as ["passwordConfirm"],
};

export const signupSchema = signupFieldsSchema.refine(
  (data) => data.password === data.passwordConfirm,
  passwordConfirmRefine
);

export type SignupInput = z.infer<typeof signupSchema>;

/** 약관 동의 — UI·RHF 전용 (API 미전송) */
export const termsFormSchema = z.object({
  all: z.boolean(),
  service: z.boolean(),
  privacy: z.boolean(),
  marketing: z.boolean(),
  marketingEmail: z.boolean(),
  marketingSms: z.boolean(),
});

export type TermsFormInput = z.infer<typeof termsFormSchema>;

export const initialTermsFormValues: TermsFormInput = {
  all: false,
  service: false,
  privacy: false,
  marketing: false,
  marketingEmail: false,
  marketingSms: false,
};

/** Client RHF resolver — signupSchema + 약관·닉네임·주소 */
export const signupFormSchema = signupFieldsSchema
  .extend({
    nickname: z
      .string()
      .regex(NICKNAME_PATTERN, "닉네임은 한글 2~10자여야 합니다."),
    region: z
      .string()
      .min(1, "주소를 검색해 주세요.")
      .max(200, "주소는 200자 이하여야 합니다."),
    /** UI 표시 주소와 별도 — member-service address(법정동) */
    regionLegalDong: z
      .string()
      .min(1, "주소를 검색해 주세요.")
      .max(100, "주소는 100자 이하여야 합니다."),
    terms: termsFormSchema,
  })
  .refine(
    (data) => data.password === data.passwordConfirm,
    passwordConfirmRefine
  )
  .superRefine((data, ctx) => {
    if (!data.terms.service || !data.terms.privacy) {
      ctx.addIssue({
        code: "custom",
        message: "필수 약관에 동의해 주세요.",
        path: ["terms"],
      });
    }
  });

export type SignupFormInput = z.infer<typeof signupFormSchema>;

export type SignupFieldErrors = Partial<
  Record<
    keyof SignupInput | "nickname" | "region" | "regionLegalDong",
    string[] | undefined
  >
>;

/** Server Action 검증 — auth 필드 + member 필드 */
export const signupOrchestrationSchema = signupSchema.and(
  z.object({
    nickname: z
      .string()
      .regex(NICKNAME_PATTERN, "닉네임은 한글 2~10자여야 합니다."),
    region: z
      .string()
      .min(1, "주소를 검색해 주세요.")
      .max(200, "주소는 200자 이하여야 합니다."),
    regionLegalDong: z
      .string()
      .min(1, "주소를 검색해 주세요.")
      .max(100, "주소는 100자 이하여야 합니다."),
  })
);

export type SignupOrchestrationInput = z.infer<
  typeof signupOrchestrationSchema
>;

/** 고아 계정 복구 — 아이디·비밀번호·닉네임·주소만 (본인인증 불필요) */
export const signupResumeOrchestrationSchema = z.object({
  logInId: z
    .string()
    .regex(
      LOGIN_ID_PATTERN,
      "아이디는 영문 소문자와 숫자 조합 4~20자여야 합니다."
    ),
  password: z.string().regex(PASSWORD_PATTERN, PASSWORD_VALIDATION_MESSAGE),
  nickname: z
    .string()
    .regex(NICKNAME_PATTERN, "닉네임은 한글 2~10자여야 합니다."),
  region: z
    .string()
    .min(1, "주소를 검색해 주세요.")
    .max(200, "주소는 200자 이하여야 합니다."),
  regionLegalDong: z
    .string()
    .min(1, "주소를 검색해 주세요.")
    .max(100, "주소는 100자 이하여야 합니다."),
});

export type SignupResumeOrchestrationInput = z.infer<
  typeof signupResumeOrchestrationSchema
>;

export const signupResumeFormSchema = signupResumeOrchestrationSchema;

export type SignupResumeFormInput = z.infer<typeof signupResumeFormSchema>;

export const emptySignupResumeFormValues: SignupResumeFormInput = {
  logInId: "",
  password: "",
  nickname: "",
  region: "",
  regionLegalDong: "",
};

export const emptySignupValues: SignupInput = {
  logInId: "",
  password: "",
  passwordConfirm: "",
  email: "",
  name: "",
  phone: "",
};

export const emptySignupFormValues: SignupFormInput = {
  ...emptySignupValues,
  nickname: "",
  region: "",
  regionLegalDong: "",
  terms: initialTermsFormValues,
};
