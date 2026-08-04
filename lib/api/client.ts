/**
 * Transaction / data layer — API_URL(Gateway) 호출은 이 모듈 트리에서만.
 * 클라이언트 번들에서 getApiUrl() 호출 시 throw — Server Action 경유 강제.
 */
export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
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

export async function apiFetch<T>(
  path: string,
  options: {
    method?: string;
    body?: unknown;
    accessToken?: string | null;
    cache?: FetchCacheOpts;
    baseUrl?: string;
  } = {}
): Promise<T> {
  const base = (options.baseUrl ?? getApiUrl()).replace(/\/$/, "");
  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;
  const headers: Record<string, string> = { Accept: "application/json" };

  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (options.accessToken) {
    headers.Authorization = `Bearer ${options.accessToken}`;
  }

  const cache = options.cache;
  const useTags = Boolean(cache?.tags?.length);
  const init: RequestInit & {
    next?: { tags?: string[]; revalidate?: number | false };
  } = {
    method: options.method ?? "GET",
    headers,
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
