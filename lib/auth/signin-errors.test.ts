import { describe, expect, it } from "vitest";

import {
  buildAuthorizeErrorPayload,
  isSecurityStoreUnavailableApiError,
  parseSignInError,
  signInErrorMessage,
} from "@/lib/auth/signin-errors";

describe("buildAuthorizeErrorPayload", () => {
  it("keeps 401 as wrong credentials", () => {
    const parsed = buildAuthorizeErrorPayload(401, {
      timestamp: "",
      status: 401,
      code: "AUTH_UNAUTHORIZED",
      message: "아이디 또는 비밀번호가 올바르지 않습니다.",
      path: "",
    });
    expect(parsed.code).toBe("AUTH_UNAUTHORIZED");
    expect(signInErrorMessage(parsed)).toBe(
      "아이디 또는 비밀번호가 올바르지 않습니다."
    );
  });

  it("maps AUTH_SECURITY_STORE_UNAVAILABLE to a temporary outage", () => {
    const parsed = buildAuthorizeErrorPayload(503, {
      timestamp: "",
      status: 503,
      code: "AUTH_SECURITY_STORE_UNAVAILABLE",
      message:
        "인증 서비스를 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해 주세요.",
      path: "",
    });
    expect(parsed.code).toBe("AUTH_SECURITY_STORE_UNAVAILABLE");
    expect(signInErrorMessage(parsed)).toBe(
      "인증 서비스를 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해 주세요."
    );
  });

  it("maps status 503 without a known code to a temporary outage, not wrong password", () => {
    const parsed = buildAuthorizeErrorPayload(503, null);
    expect(parsed.code).toBe("AUTH_SECURITY_STORE_UNAVAILABLE");
    expect(signInErrorMessage(parsed)).not.toBe(
      "아이디 또는 비밀번호가 올바르지 않습니다."
    );
  });
});

describe("parseSignInError", () => {
  it("reads the JSON payload NextAuth forwards from authorize", () => {
    const parsed = parseSignInError(
      JSON.stringify({
        code: "AUTH_SECURITY_STORE_UNAVAILABLE",
        message:
          "인증 서비스를 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해 주세요.",
      })
    );
    expect(parsed.code).toBe("AUTH_SECURITY_STORE_UNAVAILABLE");
    expect(signInErrorMessage(parsed)).toContain("일시적으로");
  });
});

describe("isSecurityStoreUnavailableApiError", () => {
  it("matches the store code or HTTP 503", () => {
    expect(
      isSecurityStoreUnavailableApiError({
        code: "AUTH_SECURITY_STORE_UNAVAILABLE",
        status: 200,
      })
    ).toBe(true);
    expect(isSecurityStoreUnavailableApiError({ status: 503 })).toBe(true);
    expect(
      isSecurityStoreUnavailableApiError({
        code: "AUTH_UNAUTHORIZED",
        status: 401,
      })
    ).toBe(false);
  });
});
