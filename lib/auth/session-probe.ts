import { cookies } from "next/headers";

import { pingAuthSession, probeAuthRefresh } from "@/lib/api/auth";
import {
  applyResponseCookies,
  buildAuthCookieHeader,
  hasDuplicateLoginFlag,
  markDuplicateLoginDetected,
} from "@/lib/auth/cookie-store";
import { AUTH_COOKIE_ACCESS, AUTH_COOKIE_REFRESH } from "@/lib/auth/cookies";
import {
  AUTH_SESSION_TERMINATED,
  isJwtExpired,
} from "@/lib/auth/duplicate-login";
import type { ApiErrorResponse } from "@/types/auth/api";

function logBackendUnreachable(context: string, err: unknown): void {
  if (process.env.NODE_ENV !== "development") return;
  const detail = err instanceof Error ? err.message : String(err);
  console.warn(
    `[session-probe] Backend unreachable during ${context}; skipping duplicate login check (${detail})`
  );
}

async function parseErrorBody(text: string): Promise<ApiErrorResponse | null> {
  if (!text) return null;
  try {
    return JSON.parse(text) as ApiErrorResponse;
  } catch {
    return null;
  }
}

async function markDuplicateLoginIfTerminated(
  status: number,
  body: Pick<ApiErrorResponse, "code"> | null | undefined
): Promise<boolean> {
  if (status === 401 && body?.code === AUTH_SESSION_TERMINATED) {
    await markDuplicateLoginDetected();
    return true;
  }
  return false;
}

async function probeViaRefresh(cookieHeader: string): Promise<boolean> {
  if (!cookieHeader.includes(AUTH_COOKIE_REFRESH)) {
    return false;
  }

  let res: Response;
  try {
    res = await probeAuthRefresh(cookieHeader);
  } catch (err) {
    logBackendUnreachable("refresh probe", err);
    return false;
  }

  if (res.ok) {
    await applyResponseCookies(res);
    return false;
  }

  const body = await parseErrorBody(await res.text());
  return markDuplicateLoginIfTerminated(res.status, body);
}

async function probeViaSessionPing(cookieHeader: string): Promise<boolean> {
  if (!cookieHeader.includes(AUTH_COOKIE_ACCESS)) {
    return false;
  }

  let res: Response;
  try {
    res = await pingAuthSession(cookieHeader);
  } catch (err) {
    logBackendUnreachable("session ping", err);
    return false;
  }

  if (res.ok) {
    return false;
  }

  const body = await parseErrorBody(await res.text());
  return markDuplicateLoginIfTerminated(res.status, body);
}

/**
 * HttpOnly Cookie가 있는 사용자의 duplicate login 여부 probe.
 * - GET /auth/session: Gateway blacklist(read-only)
 * - access 만료·누락 시 refresh 실패로 보조 판별
 */
export async function probeDuplicateLoginSession(): Promise<boolean> {
  if (await hasDuplicateLoginFlag()) {
    return true;
  }

  const store = await cookies();
  const access = store.get(AUTH_COOKIE_ACCESS)?.value;
  const refresh = store.get(AUTH_COOKIE_REFRESH)?.value;
  if (!access && !refresh) {
    return false;
  }

  const cookieHeader = await buildAuthCookieHeader();
  if (!cookieHeader) {
    return false;
  }

  if (access && !isJwtExpired(access)) {
    return probeViaSessionPing(cookieHeader);
  }

  return probeViaRefresh(cookieHeader);
}
