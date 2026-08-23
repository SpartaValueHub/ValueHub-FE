import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth/cookie-store", () => ({
  applyResponseCookies: vi.fn(),
  buildAuthCookieHeader: vi.fn().mockResolvedValue(undefined),
  extractAuthCookieHeaderFromResponse: vi.fn(),
}));

vi.mock("@/lib/auth/clear-expired-session", () => ({
  clearExpiredAuthSession: vi.fn().mockResolvedValue(undefined),
}));

import { ApiTimeoutError, apiFetch } from "@/lib/api/client";

describe("apiFetch timeout", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("throws ApiTimeoutError when the configured deadline expires", async () => {
    vi.useFakeTimers();
    vi.stubGlobal(
      "fetch",
      vi.fn(
        (_url, init?: RequestInit) =>
          new Promise((_resolve, reject) => {
            init?.signal?.addEventListener("abort", () =>
              reject(new DOMException("aborted", "AbortError"))
            );
          })
      )
    );

    const request = apiFetch("/slow", {
      baseUrl: "http://backend.test",
      timeoutMillis: 25,
      skipSessionRecovery: true,
    });
    const assertion = expect(request).rejects.toBeInstanceOf(ApiTimeoutError);
    await vi.advanceTimersByTimeAsync(25);
    await assertion;
  });

  it("preserves a backend 409 response instead of treating it as a timeout", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response(
            JSON.stringify({
              code: "MEMBER_PROFILE_CONFLICT",
              message: "conflict",
            }),
            { status: 409, headers: { "Content-Type": "application/json" } }
          )
        )
    );

    await expect(
      apiFetch("/members", {
        baseUrl: "http://backend.test",
        skipSessionRecovery: true,
      })
    ).rejects.toMatchObject({
      status: 409,
      code: "MEMBER_PROFILE_CONFLICT",
    });
  });
});
