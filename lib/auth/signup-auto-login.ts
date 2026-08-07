export type SignupAutoLoginPhase = "idle" | "pending" | "success" | "failed";

export type SignupAutoLoginInput = {
  logInId: string;
  password: string;
};

export type SignupAutoLoginResult =
  { ok: true } | { ok: false; message: string };

type SignInFn = (
  provider: string,
  options: Record<string, unknown>
) => Promise<{ error?: string | null; ok?: boolean } | undefined>;

export const SIGNUP_AUTO_LOGIN_FAILED_MESSAGE =
  "회원가입은 완료되었습니다. 자동 로그인에 실패했습니다.";

export const SIGNUP_AUTO_LOGIN_FAILED_FOOTER =
  "로그인 페이지에서 다시 로그인해 주세요.";

export function canStartSignupAutoLogin(phase: SignupAutoLoginPhase): boolean {
  return phase === "idle";
}

export async function runSignupAutoLogin(
  input: SignupAutoLoginInput,
  signInFn: SignInFn
): Promise<SignupAutoLoginResult> {
  let result: { error?: string | null; ok?: boolean } | undefined;
  try {
    result = await signInFn("credentials", {
      logInId: input.logInId,
      password: input.password,
      redirect: false,
    });
  } catch {
    return {
      ok: false,
      message: SIGNUP_AUTO_LOGIN_FAILED_MESSAGE,
    };
  }

  if (result?.error || !result?.ok) {
    return {
      ok: false,
      message: SIGNUP_AUTO_LOGIN_FAILED_MESSAGE,
    };
  }

  return { ok: true };
}
