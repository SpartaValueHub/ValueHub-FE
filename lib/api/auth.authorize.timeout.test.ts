import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth/cookie-store", () => ({
  applyResponseCookies: vi.fn(),
  extractAuthCookieHeaderFromResponse: vi.fn().mockReturnValue(undefined),
}));

vi.mock("@/lib/api/client", async () => {
  const actual =
    await vi.importActual<typeof import("@/lib/api/client")>(
      "@/lib/api/client"
    );
  return {
    ...actual,
    getApiUrl: () => "http://backend.test",
  };
});

import { ApiTimeoutError } from "@/lib/api/client";
import { signInUserForAuthorize } from "@/lib/api/auth.authorize";

describe("signInUserForAuthorize timeout", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("throws ApiTimeoutError when the configured deadline expires", async () => {
    vi.stubEnv("AUTH_SIGNIN_TIMEOUT_MILLIS", "25");
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

    const request = signInUserForAuthorize({
      logInId: "user1",
      password: "Password1!",
    });
    const assertion = expect(request).rejects.toBeInstanceOf(ApiTimeoutError);
    await vi.advanceTimersByTimeAsync(25);
    await assertion;
  });

  it("preserves a backend 401 payload instead of treating it as a timeout", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            code: "AUTH_UNAUTHORIZED",
            message: "unauthorized",
          }),
          { status: 401, headers: { "Content-Type": "application/json" } }
        )
      )
    );

    await expect(
      signInUserForAuthorize({
        logInId: "user1",
        password: "wrong",
      })
    ).rejects.toSatisfy((error: unknown) => {
      if (!(error instanceof Error)) return false;
      const parsed = JSON.parse(error.message) as { code?: string };
      return parsed.code === "AUTH_UNAUTHORIZED";
    });
  });
});
