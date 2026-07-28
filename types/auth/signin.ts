import { z } from "zod";

export const signinSchema = z.object({
  logInId: z
    .string()
    .min(4, "아이디는 4자 이상이어야 합니다.")
    .max(20, "아이디는 20자 이하여야 합니다."),
  password: z
    .string()
    .min(8, "비밀번호는 8자 이상이어야 합니다.")
    .max(32, "비밀번호는 32자 이하여야 합니다."),
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
