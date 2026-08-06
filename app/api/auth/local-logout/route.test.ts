import { beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "@/app/api/auth/local-logout/route";

vi.mock("@/lib/auth/cookie-store", () => ({
  clearAuthCookies: vi.fn(),
  clearDuplicateLoginFlag: vi.fn(),
}));

vi.mock("@/lib/auth/nextauth-session", () => ({
  clearNextAuthSession: vi.fn(),
}));

import {
  clearAuthCookies,
  clearDuplicateLoginFlag,
} from "@/lib/auth/cookie-store";
import { clearNextAuthSession } from "@/lib/auth/nextauth-session";

describe("POST /api/auth/local-logout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("백엔드 logout 없이 로컬 세션만 정리", async () => {
    const res = await POST();
    const body = await res.json();

    expect(body).toEqual({ ok: true });
    expect(clearAuthCookies).toHaveBeenCalledOnce();
    expect(clearDuplicateLoginFlag).toHaveBeenCalledOnce();
    expect(clearNextAuthSession).toHaveBeenCalledOnce();
  });
});
