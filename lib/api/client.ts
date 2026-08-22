/**
 * Transaction / data layer — API_URL(Gateway) 호출은 이 module 트리에서만.
 * HttpOnly Cookie 인증 — credentials: include, Authorization Bearer 미사용.
 */
import {
  applyResponseCookies,
  buildAuthCookieHeader,
} from "@/lib/auth/cookie-store";
import { AUTH_COOKIE_REFRESH } from "@/lib/auth/cookies";
import { API_ENDPOINTS } from "@/lib/api/endpoints";

export class ApiError extends Error {
  status: number;
  code?: string;
  retryAfterSeconds?: number;

  constructor(
    status: number,
    message: string,
    code?: string,
    retryAfterSeconds?: number
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export class AuthSessionExpiredError extends Error {
  constructor(message = "세션이 만료되었습니다. 다시 로그인해 주세요.") {
    super(message);
    this.name = "AuthSessionExpiredError";
  }
}

export class ApiTimeoutError extends Error {
  readonly timeoutMillis: number;

  constructor(timeoutMillis: number) {
    super("요청 시간이 초과되었습니다. 잠시 후 다시 시도해 주세요.");
    this.name = "ApiTimeoutError";
    this.timeoutMillis = timeoutMillis;
  }
}

function assertServerOnlyApiUrl() {
  if (typeof window !== "undefined") {
    throw new Error(
      "외부 API는 서버에서만 호출하세요. 클라이언트는 Server Actions를 사용합니다."
    );
  }
}

export function getApiUrl() {
  assertServerOnlyApiUrl();

  const raw =
    process.env.API_URL ||
    process.env.API_BASE_URL ||
    "http://localhost:8000/auth-service";

  return raw.replace(/\/$/, "");
}

/** Gateway member-service prefix — 서버 전용 */
export function getMemberApiUrl() {
  assertServerOnlyApiUrl();

  const raw =
    process.env.MEMBER_API_URL ||
    (
      process.env.API_URL ||
      process.env.API_BASE_URL ||
      "http://localhost:8000/auth-service"
    ).replace(/\/auth-service\/?$/, "/member-service");

  return raw.replace(/\/$/, "");
}

/** Gateway category-service — auth API_URL과 분리 (다른 서비스 영향 금지) */
export function getCategoryApiUrl() {
  assertServerOnlyApiUrl();

  const raw =
    process.env.CATEGORY_API_URL || "http://localhost:8000/category-service";

  return raw.replace(/\/$/, "");
}

/** Gateway chat-service — 서버 전용 */
export function getChatApiUrl() {
  assertServerOnlyApiUrl();

  const raw = process.env.CHAT_API_URL || "http://localhost:8000/chat-service";

  return raw.replace(/\/$/, "");
}

/** Gateway product-post-service — 서버 전용 */
export function getProductPostApiUrl() {
  assertServerOnlyApiUrl();

  const raw =
    process.env.PRODUCT_POST_API_URL ||
    "http://localhost:8000/product-post-service";

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
  /** sign-in 등 Set-Cookie 응답을 Next cookie store에 반영 */
  /** sign-in 직후 동일 요청 연쇄 호출용 Cookie 헤더 (store 반영 전) */
  cookieHeader?: string;
  /** applyAuthCookies 시 추출한 Cookie 헤더를 받을 out ref */
  /** sign-in Set-Cookie 진단 (dev) */
  /** true면 cookieHeader 미지정 시 buildAuthCookieHeader fallback 금지 */
  authorizationBearer?: string;
  timeoutMillis?: number;
};

function positiveMillis(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export function apiTimeoutFromEnv(name: string, fallback: number) {
  return positiveMillis(process.env[name], fallback);
}

const DEFAULT_TIMEOUT_MILLIS = positiveMillis(
  process.env.API_TIMEOUT_MILLIS,
  5_000
);

function getTrustedOriginHeader(): Record<string, string> {
  const origin = process.env.AUTH_TRUSTED_ORIGIN?.trim();
  return origin ? { Origin: origin } : {};
}

async function refreshAuthCookies(): Promise<boolean> {
  const cookieHeader = await buildAuthCookieHeader();
  if (!cookieHeader?.includes(AUTH_COOKIE_REFRESH)) {
    return false;
  }

  const authBaseUrl = getApiUrl();
  const url = `${authBaseUrl}${API_ENDPOINTS.auth.refresh}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MILLIS);
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Cookie: cookieHeader,
        ...getTrustedOriginHeader(),
      },
      cache: "no-store",
      signal: controller.signal,
    });
  } catch (error) {
    if (controller.signal.aborted) {
      throw new ApiTimeoutError(DEFAULT_TIMEOUT_MILLIS);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }

  if (res.ok) {
    await applyResponseCookies(res);
    return true;
  }

  return false;
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

  if (options.authorizationBearer) {
    headers.Authorization = `Bearer ${options.authorizationBearer}`;
  }

  let cookieHeader = options.cookieHeader;
  if (cookieHeader === undefined) {
    cookieHeader = await buildAuthCookieHeader();
  }
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
  const timeoutMillis = options.timeoutMillis ?? DEFAULT_TIMEOUT_MILLIS;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMillis);
  init.signal = controller.signal;

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
    if (controller.signal.aborted) {
      throw new ApiTimeoutError(timeoutMillis);
    }
    const detail = err instanceof Error ? err.message : "network error";
    throw new ApiError(502, `API에 연결할 수 없습니다 (${base}). ${detail}`);
  } finally {
    clearTimeout(timer);
  }

  const inlineCookieProvided = options.cookieHeader !== undefined;

  if (res.status === 401 && !options._retried && !options.skipSessionRecovery) {
    if (inlineCookieProvided) {
      const text = await res.text();
      let json: unknown = null;
      if (text) {
        try {
          json = JSON.parse(text);
        } catch {
          json = null;
        }
      }
      const body = json as {
        message?: string;
        code?: string;
        retryAfterSeconds?: number;
      } | null;
      const message =
        body?.message || text || `API 오류 (${res.status} ${res.statusText})`;
      throw new ApiError(
        res.status,
        message,
        body?.code,
        body?.retryAfterSeconds
      );
    }

    const refreshed = await refreshAuthCookies();
    if (refreshed) {
      return apiFetch<T>(path, { ...options, _retried: true });
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
      retryAfterSeconds?: number;
    } | null;
    const message =
      body?.message ||
      body?.error ||
      text ||
      `API 오류 (${res.status} ${res.statusText})`;
    throw new ApiError(
      res.status,
      message,
      body?.code,
      body?.retryAfterSeconds
    );
  }

  return json as T;
}
