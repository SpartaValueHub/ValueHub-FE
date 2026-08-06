import { describe, expect, it } from "vitest";

import { ApiError } from "@/lib/api/client";
import { mapActionError } from "@/lib/auth/map-action-error";

describe("mapActionError", () => {
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
