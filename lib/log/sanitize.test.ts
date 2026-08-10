import { describe, expect, it } from "vitest";

import { maskLoginId, sanitizeForLog } from "@/lib/log/sanitize";

describe("maskLoginId", () => {
  it("masks loginId with first two characters", () => {
    expect(maskLoginId("user01")).toBe("us***");
  });

  it("handles short values", () => {
    expect(maskLoginId("ab")).toBe("ab***");
    expect(maskLoginId("a")).toBe("a***");
  });
});

describe("sanitizeForLog", () => {
  it("redacts sensitive object keys", () => {
    expect(
      sanitizeForLog({
        logInId: "user01",
        password: "Secret1!",
        accessToken: "eyJhbG.abc.def",
        captchaToken: "cap-token",
        requestToken: "req-token",
      })
    ).toEqual({
      logInId: "us***",
      password: "[REDACTED]",
      accessToken: "[REDACTED]",
      captchaToken: "[REDACTED]",
      requestToken: "[REDACTED]",
    });
  });

  it("redacts JWT strings and bearer headers", () => {
    const jwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIn0.sig";
    expect(sanitizeForLog(jwt)).toBe("[REDACTED:JWT]");
    expect(sanitizeForLog(`Authorization: Bearer ${jwt}`)).toBe(
      "Authorization: Bearer [REDACTED]"
    );
  });

  it("redacts cookie header values", () => {
    expect(
      sanitizeForLog("accessToken=secret-value; refreshToken=refresh-value")
    ).toBe("accessToken=[REDACTED]; refreshToken=[REDACTED]");
  });

  it("sanitizes Error messages", () => {
    const error = new Error(
      JSON.stringify({ password: "Secret1!", logInId: "user01" })
    );
    expect(sanitizeForLog(error)).toEqual({
      name: "Error",
      message: JSON.stringify({
        password: "[REDACTED]",
        logInId: "us***",
      }),
    });
  });

  it("sanitizes FormData entries", () => {
    const form = new FormData();
    form.set("logInId", "user01");
    form.set("password", "Secret1!");
    form.set("captchaToken", "cap");

    expect(sanitizeForLog(form)).toEqual({
      FormData: {
        logInId: "us***",
        password: "[REDACTED]",
        captchaToken: "[REDACTED]",
      },
    });
  });
});
