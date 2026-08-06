import { beforeEach, describe, expect, it, vi } from "vitest";

import { GET } from "@/app/api/auth/session-event/route";
import { AUTH_SESSION_TERMINATED } from "@/lib/auth/duplicate-login";

vi.mock("@/lib/auth/cookie-store", () => ({
  hasDuplicateLoginFlag: vi.fn(),
  hasSessionMaterial: vi.fn(),
  clearDuplicateLoginFlag: vi.fn(),
}));

vi.mock("@/lib/auth/session-probe", () => ({
  probeDuplicateLoginSession: vi.fn(),
}));

import {
  hasDuplicateLoginFlag,
  hasSessionMaterial,
} from "@/lib/auth/cookie-store";
import { probeDuplicateLoginSession } from "@/lib/auth/session-probe";

const mockHasFlag = vi.mocked(hasDuplicateLoginFlag);
const mockHasMaterial = vi.mocked(hasSessionMaterial);
const mockProbe = vi.mocked(probeDuplicateLoginSession);

describe("GET /api/auth/session-event", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("플래그가 있으면 NextAuth 없이 duplicateLogin=true", async () => {
    mockHasMaterial.mockResolvedValue(false);
    mockHasFlag.mockResolvedValue(true);

    const res = await GET();
    const body = await res.json();

    expect(body).toEqual({ duplicateLogin: true, hasSessionMaterial: false });
    expect(mockProbe).not.toHaveBeenCalled();
  });

  it("세션 material 없으면 probe 없이 false", async () => {
    mockHasMaterial.mockResolvedValue(false);
    mockHasFlag.mockResolvedValue(false);

    const res = await GET();
    const body = await res.json();

    expect(body).toEqual({ duplicateLogin: false, hasSessionMaterial: false });
    expect(mockProbe).not.toHaveBeenCalled();
  });

  it("material 있고 probe가 duplicate면 true", async () => {
    mockHasMaterial.mockResolvedValue(true);
    mockHasFlag.mockResolvedValue(false);
    mockProbe.mockResolvedValue(true);

    const res = await GET();
    const body = await res.json();

    expect(body).toEqual({ duplicateLogin: true, hasSessionMaterial: true });
    expect(mockProbe).toHaveBeenCalledOnce();
  });

  it("material 있고 probe가 backend unreachable이면 200 + duplicateLogin false", async () => {
    mockHasMaterial.mockResolvedValue(true);
    mockHasFlag.mockResolvedValue(false);
    mockProbe.mockResolvedValue(false);

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ duplicateLogin: false, hasSessionMaterial: true });
    expect(mockProbe).toHaveBeenCalledOnce();
  });

  it("probe가 fetch failed를 throw해도 200 + duplicateLogin false", async () => {
    mockHasMaterial.mockResolvedValue(true);
    mockHasFlag.mockResolvedValue(false);
    mockProbe.mockRejectedValue(
      new TypeError("fetch failed", {
        cause: new AggregateError([], "ECONNREFUSED"),
      })
    );

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ duplicateLogin: false, hasSessionMaterial: true });
    expect(mockProbe).toHaveBeenCalledOnce();
  });
});

describe("AUTH_SESSION_TERMINATED", () => {
  it("duplicate login 전용 코드", () => {
    expect(AUTH_SESSION_TERMINATED).toBe("AUTH_SESSION_TERMINATED");
  });
});
