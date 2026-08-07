import {
  applyResponseCookies,
  extractAuthCookieHeaderFromResponse,
} from "@/lib/auth/cookie-store";
import { buildAuthorizeErrorPayload } from "@/lib/auth/signin-errors";
import { normalizeSignInResponse } from "@/lib/auth/sign-in-response";
import {
  ApiTimeoutError,
  apiTimeoutFromEnv,
  getApiUrl,
} from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type { ApiErrorResponse, ApiSignInResponse } from "@/types/auth/api";

type AuthorizeSignInInput = {
  logInId: string;
  password: string;
  captchaToken?: string;
};

/** NextAuth authorize 전용 — captcha·API error code를 CredentialsSignin payload로 전달 */
export async function signInUserForAuthorize(input: AuthorizeSignInInput) {
  const body: Record<string, string> = {
    logInId: input.logInId,
    password: input.password,
  };
  if (input.captchaToken) {
    body.captchaToken = input.captchaToken;
  }

  const timeoutMillis = apiTimeoutFromEnv("AUTH_SIGNIN_TIMEOUT_MILLIS", 5_000);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMillis);

  let res: Response;
  try {
    res = await fetch(`${getApiUrl()}${API_ENDPOINTS.auth.signIn}`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: controller.signal,
    });
  } catch (error) {
    if (controller.signal.aborted) {
      throw new ApiTimeoutError(timeoutMillis);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    const errorText = await res.text();
    let errorBody: ApiErrorResponse | null = null;
    if (errorText) {
      try {
        errorBody = JSON.parse(errorText) as ApiErrorResponse;
      } catch {
        errorBody = null;
      }
    }
    const payload = buildAuthorizeErrorPayload(res.status, errorBody);
    throw new Error(JSON.stringify(payload));
  }

  const authCookieHeader = extractAuthCookieHeaderFromResponse(res);
  await applyResponseCookies(res);
  const data = (await res.json()) as ApiSignInResponse;

  return {
    cookieHeader: authCookieHeader,
    signIn: normalizeSignInResponse(data),
  };
}
