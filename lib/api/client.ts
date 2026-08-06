/**
 * Transaction / data layer — API_URL(Gateway) 호출은 이 module 트리에서만.
 * HttpOnly Cookie 인증 — credentials: include, Authorization Bearer 미사용.
 */
import {
  applyResponseCookies,
  buildAuthCookieHeader,
  markDuplicateLoginDetected,
} from "@/lib/auth/cookie-store";
import { AUTH_COOKIE_REFRESH } from "@/lib/auth/cookies";
import {
  DuplicateLoginError,
  isDuplicateLoginRefreshFailure,
} from "@/lib/auth/duplicate-login";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type { ApiErrorResponse } from "@/types/auth/api";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export class AuthSessionExpiredError extends Error {
  constructor(message = "세션이 만료되었습니다. 다시 로그인해 주세요.") {
    super(message);
    this.name = "AuthSessionExpiredError";
  }
}

export function getApiUrl() {
  if (typeof window !== "undefined") {
    throw new Error(
      "외부 API는 서버(API_URL)에서만 호출하세요. 클라이언트는 Server Actions를 사용합니다."
    );
  }

  const raw =
    process.env.API_URL ||
    process.env.API_BASE_URL ||
    "http://localhost:8000/auth-service";

  return raw.replace(/\/$/, "");
}

type FetchCacheOpts = {
  tags?: string[];
  revalidate?: number | false;
  noStore?: boolean;
};

type ApiFetchOptions = {
  method?: string;
  body?: unknown;
  cache?: FetchCacheOpts;
  baseUrl?: string;
  /** 401 refresh 재시도 방지 */
  _retried?: boolean;
  /** refresh 실패 시 signOut 생략 (authorize 등) */
  skipSessionRecovery?: boolean;
  /** auth-service refresh·logout Origin 검증용 (서버 env AUTH_TRUSTED_ORIGIN) */
  trustedOrigin?: boolean;
};

function getTrustedOriginHeader(): Record<string, string> {
  const origin = process.env.AUTH_TRUSTED_ORIGIN?.trim();
  return origin ? { Origin: origin } : {};
}

type RefreshAuthCookiesResult =
  | { ok: true }
  | { ok: false; reason: "missing_refresh" | "duplicate_login" | "expired" };

async function parseErrorBody(text: string): Promise<ApiErrorResponse | null> {
  if (!text) return null;
  try {
    return JSON.parse(text) as ApiErrorResponse;
  } catch {
    return null;
  }
}

async function refreshAuthCookies(
  baseUrl: string
): Promise<RefreshAuthCookiesResult> {
  const cookieHeader = await buildAuthCookieHeader();
  if (!cookieHeader?.includes(AUTH_COOKIE_REFRESH)) {
    return { ok: false, reason: "missing_refresh" };
  }

  const url = `${baseUrl}${API_ENDPOINTS.auth.refresh}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Cookie: cookieHeader,
      ...getTrustedOriginHeader(),
    },
    cache: "no-store",
  });

  if (res.ok) {
    await applyResponseCookies(res);
    return { ok: true };
  }

  const body = await parseErrorBody(await res.text());
  if (isDuplicateLoginRefreshFailure(res.status, body)) {
    await markDuplicateLoginDetected();
    return { ok: false, reason: "duplicate_login" };
  }

  return { ok: false, reason: "expired" };
}

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const base = (options.baseUrl ?? getApiUrl()).replace(/\/$/, "");
  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;
  const headers: Record<string, string> = { Accept: "application/json" };

  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (options.trustedOrigin) {
    Object.assign(headers, getTrustedOriginHeader());
  }

  const cookieHeader = await buildAuthCookieHeader();
  if (cookieHeader) {
    headers.Cookie = cookieHeader;
  }

  const cache = options.cache;
  const useTags = Boolean(cache?.tags?.length);
  const init: RequestInit & {
    next?: { tags?: string[]; revalidate?: number | false };
  } = {
    method: options.method ?? "GET",
    headers,
    credentials: "include",
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  };

  if (cache?.noStore || !useTags) {
    init.cache = "no-store";
    init.next = { revalidate: 0 };
  } else {
    init.next = {
      tags: cache!.tags,
      revalidate: cache?.revalidate ?? 60,
    };
  }

  let res: Response;
  try {
    res = await fetch(url, init);
  } catch (err) {
    const detail = err instanceof Error ? err.message : "network error";
    throw new ApiError(502, `API에 연결할 수 없습니다 (${base}). ${detail}`);
  }

  if (res.status === 401 && !options._retried && !options.skipSessionRecovery) {
    const errorText = await res.text();
    const errorBody = await parseErrorBody(errorText);

    if (isDuplicateLoginRefreshFailure(res.status, errorBody)) {
      await markDuplicateLoginDetected();
      throw new DuplicateLoginError();
    }

    const refreshResult = await refreshAuthCookies(base);
    if (refreshResult.ok) {
      return apiFetch<T>(path, { ...options, _retried: true });
    }
    if (refreshResult.reason === "duplicate_login") {
      throw new DuplicateLoginError();
    }
    throw new AuthSessionExpiredError();
  }

  const text = await res.text();
  let json: unknown = null;
  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      json = null;
    }
  }

  if (!res.ok) {
    const body = json as {
      message?: string;
      error?: string;
      code?: string;
    } | null;
    const message =
      body?.message ||
      body?.error ||
      text ||
      `API 오류 (${res.status} ${res.statusText})`;
    throw new ApiError(res.status, message);
  }

  return json as T;
}
