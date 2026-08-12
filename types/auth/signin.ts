import { z } from "zod";

export const signinSchema = z.object({
  logInId: z.string().trim().min(1, "아이디를 입력해 주세요."),
  password: z.string().min(1, "비밀번호를 입력해 주세요."),
});

export type SigninInput = z.infer<typeof signinSchema>;

export const emptySigninValues: SigninInput = {
  logInId: "",
  password: "",
};
