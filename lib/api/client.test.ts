import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  AUTH_SESSION_TERMINATED,
  DuplicateLoginError,
} from "@/lib/auth/duplicate-login";

vi.mock("@/lib/auth/cookie-store", () => ({
  applyResponseCookies: vi.fn(),
  buildAuthCookieHeader: vi.fn(),
  markDuplicateLoginDetected: vi.fn(),
}));

import { markDuplicateLoginDetected } from "@/lib/auth/cookie-store";
import { apiFetch, AuthSessionExpiredError } from "@/lib/api/client";
import { buildAuthCookieHeader } from "@/lib/auth/cookie-store";

const mockMarkDuplicate = vi.mocked(markDuplicateLoginDetected);
const mockBuildCookie = vi.mocked(buildAuthCookieHeader);

describe("apiFetch duplicate login detection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockBuildCookie.mockResolvedValue("refresh=token");
  });

  it("401 AUTH_SESSION_TERMINATED이면 markDuplicateLoginDetected 후 DuplicateLoginError", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce({
      status: 401,
      ok: false,
      text: async () =>
        JSON.stringify({
          code: AUTH_SESSION_TERMINATED,
          message: "terminated",
        }),
    } as Response);

    vi.stubGlobal("fetch", fetchMock);

    await expect(
      apiFetch("/api/v1/example", {
        baseUrl: "http://localhost:8000/auth-service",
      })
    ).rejects.toBeInstanceOf(DuplicateLoginError);

    expect(mockMarkDuplicate).toHaveBeenCalledOnce();
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("401 INVALID_TOKEN이면 duplicate login 처리하지 않고 세션 만료", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        status: 401,
        ok: false,
        text: async () =>
          JSON.stringify({ code: "INVALID_TOKEN", message: "invalid" }),
      } as Response)
      .mockResolvedValueOnce({
        status: 401,
        ok: false,
        text: async () => JSON.stringify({ code: "INVALID_TOKEN" }),
      } as Response);

    vi.stubGlobal("fetch", fetchMock);

    await expect(
      apiFetch("/api/v1/example", {
        baseUrl: "http://localhost:8000/auth-service",
      })
    ).rejects.toBeInstanceOf(AuthSessionExpiredError);

    expect(mockMarkDuplicate).not.toHaveBeenCalled();
  });

  it("network error이면 duplicate login 처리 없음", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new TypeError("fetch failed"))
    );

    await expect(
      apiFetch("/api/v1/example", {
        baseUrl: "http://localhost:8000/auth-service",
      })
    ).rejects.toBeInstanceOf(Error);

    expect(mockMarkDuplicate).not.toHaveBeenCalled();
  });
});
