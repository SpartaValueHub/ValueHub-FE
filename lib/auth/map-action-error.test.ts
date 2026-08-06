import { describe, expect, it } from "vitest";

import { ApiError } from "@/lib/api/client";
import {
  AUTH_SESSION_TERMINATED,
  DuplicateLoginError,
} from "@/lib/auth/duplicate-login";
import {
  isDuplicateLoginActionFailure,
  mapActionError,
} from "@/lib/auth/map-action-error";

describe("mapActionError", () => {
  it("DuplicateLoginError → AUTH_SESSION_TERMINATED code", () => {
    const result = mapActionError(new DuplicateLoginError(), "fallback");

    expect(result).toEqual({
      ok: false,
      message: expect.any(String),
      code: AUTH_SESSION_TERMINATED,
    });
  });

  it("ApiError → message만, code 없음", () => {
    const result = mapActionError(new ApiError(400, "bad request"), "fallback");

    expect(result).toEqual({ ok: false, message: "bad request" });
  });

  it("INVALID_TOKEN ApiError → code 없음", () => {
    const result = mapActionError(
      new ApiError(401, "invalid token"),
      "fallback"
    );

    expect(result.code).toBeUndefined();
  });

  it("일반 Error → message", () => {
    const result = mapActionError(new Error("network"), "fallback");

    expect(result).toEqual({ ok: false, message: "network" });
  });
});

describe("isDuplicateLoginActionFailure", () => {
  it("AUTH_SESSION_TERMINATED code이면 true", () => {
    expect(
      isDuplicateLoginActionFailure({
        ok: false,
        code: AUTH_SESSION_TERMINATED,
      })
    ).toBe(true);
  });

  it("ok:true이면 false", () => {
    expect(isDuplicateLoginActionFailure({ ok: true })).toBe(false);
  });

  it("code 없으면 false", () => {
    expect(isDuplicateLoginActionFailure({ ok: false, message: "err" })).toBe(
      false
    );
  });
});
