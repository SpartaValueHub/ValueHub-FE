import { describe, expect, it } from "vitest";

import {
  AUTH_SESSION_TERMINATED,
  getJwtExpiryEpochSeconds,
  isDuplicateLoginRefreshFailure,
  isJwtExpired,
} from "@/lib/auth/duplicate-login";

function buildJwt(payload: Record<string, unknown>): string {
  const header = Buffer.from(JSON.stringify({ alg: "none" })).toString(
    "base64url"
  );
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${header}.${body}.sig`;
}

describe("getJwtExpiryEpochSeconds", () => {
  it("exp 클레임을 반환한다", () => {
    const token = buildJwt({ exp: 1_700_000_000 });
    expect(getJwtExpiryEpochSeconds(token)).toBe(1_700_000_000);
  });

  it("잘못된 토큰이면 null", () => {
    expect(getJwtExpiryEpochSeconds("not-a-jwt")).toBeNull();
  });
});

describe("isJwtExpired", () => {
  it("만료 시각 이전이면 false", () => {
    const token = buildJwt({ exp: 4_000_000_000 });
    expect(isJwtExpired(token, 1_700_000_000_000)).toBe(false);
  });

  it("만료 시각 이후이면 true", () => {
    const token = buildJwt({ exp: 1_000 });
    expect(isJwtExpired(token, 2_000_000)).toBe(true);
  });
});

describe("isDuplicateLoginRefreshFailure", () => {
  it("AUTH_SESSION_TERMINATED이면 duplicate login", () => {
    expect(
      isDuplicateLoginRefreshFailure(401, { code: AUTH_SESSION_TERMINATED })
    ).toBe(true);
  });

  it("401 INVALID_TOKEN이면 duplicate login 아님", () => {
    expect(isDuplicateLoginRefreshFailure(401, { code: "INVALID_TOKEN" })).toBe(
      false
    );
  });

  it("403 AUTH_SESSION_TERMINATED이면 duplicate login 아님", () => {
    expect(
      isDuplicateLoginRefreshFailure(403, { code: AUTH_SESSION_TERMINATED })
    ).toBe(false);
  });

  it("401 AUTH_UNAUTHORIZED이면 duplicate login 아님", () => {
    expect(
      isDuplicateLoginRefreshFailure(401, { code: "AUTH_UNAUTHORIZED" })
    ).toBe(false);
  });
});
