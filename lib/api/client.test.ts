import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth/cookie-store", () => ({
  applyResponseCookies: vi.fn(),
  buildAuthCookieHeader: vi.fn(),
}));

import { apiFetch, AuthSessionExpiredError } from "@/lib/api/client";
import { buildAuthCookieHeader } from "@/lib/auth/cookie-store";

const mockBuildCookie = vi.mocked(buildAuthCookieHeader);

describe("apiFetch session recovery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockBuildCookie.mockResolvedValue("vh_refresh_token=token");
  });

  it("401이면 refresh 시도 후 재요청", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        status: 401,
        ok: false,
        text: async () => JSON.stringify({ code: "INVALID_TOKEN" }),
      } as Response)
      .mockResolvedValueOnce({
        status: 200,
        ok: true,
        headers: { getSetCookie: () => [] },
        text: async () => JSON.stringify({ ok: true }),
      } as Response)
      .mockResolvedValueOnce({
        status: 200,
        ok: true,
        text: async () => JSON.stringify({ data: "ok" }),
      } as Response);

    vi.stubGlobal("fetch", fetchMock);

    const result = await apiFetch<{ data: string }>("/api/v1/example", {
      baseUrl: "http://localhost:8000/auth-service",
    });

    expect(result).toEqual({ data: "ok" });
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("401 refresh 실패 시 AuthSessionExpiredError", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        status: 401,
        ok: false,
        text: async () =>
          JSON.stringify({
            code: "AUTH_SESSION_TERMINATED",
            message: "terminated",
          }),
      } as Response)
      .mockResolvedValueOnce({
        status: 401,
        ok: false,
        text: async () =>
          JSON.stringify({
            code: "AUTH_SESSION_TERMINATED",
            message: "terminated",
          }),
      } as Response);

    vi.stubGlobal("fetch", fetchMock);

    await expect(
      apiFetch("/api/v1/example", {
        baseUrl: "http://localhost:8000/auth-service",
      })
    ).rejects.toBeInstanceOf(AuthSessionExpiredError);
  });

  it("network error이면 ApiError", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new TypeError("fetch failed"))
    );

    await expect(
      apiFetch("/api/v1/example", {
        baseUrl: "http://localhost:8000/auth-service",
      })
    ).rejects.toBeInstanceOf(Error);
  });
});
