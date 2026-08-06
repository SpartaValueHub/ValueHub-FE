import { describe, expect, it } from "vitest";

import { ApiError } from "@/lib/api/client";
import { isIgnorableLogoutFailure } from "@/lib/auth/logout-errors";

describe("isIgnorableLogoutFailure", () => {
  it("401 ApiError는 무시", () => {
    expect(isIgnorableLogoutFailure(new ApiError(401, "Unauthorized"))).toBe(
      true
    );
  });

  it("403 ApiError는 무시", () => {
    expect(isIgnorableLogoutFailure(new ApiError(403, "Forbidden"))).toBe(true);
  });

  it("500 ApiError는 무시하지 않음", () => {
    expect(
      isIgnorableLogoutFailure(new ApiError(500, "Internal Server Error"))
    ).toBe(false);
  });
});
