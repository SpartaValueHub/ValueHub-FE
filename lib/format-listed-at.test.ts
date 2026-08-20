import { describe, expect, it } from "vitest";

import { formatListedAt } from "@/lib/format-listed-at";

describe("formatListedAt", () => {
  const now = Date.parse("2026-08-20T12:00:00.000Z");

  it("returns 방금 전 for < 60s", () => {
    expect(formatListedAt("2026-08-20T11:59:30.000Z", now)).toBe("방금 전");
  });

  it("returns minutes", () => {
    expect(formatListedAt("2026-08-20T11:30:00.000Z", now)).toBe("30분 전");
  });

  it("returns empty for invalid iso", () => {
    expect(formatListedAt("not-a-date", now)).toBe("");
  });
});
