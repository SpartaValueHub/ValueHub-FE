import { describe, expect, it } from "vitest";

import {
  formatProductListLocationDong,
  formatProductListLocationLabel,
} from "@/lib/member-regions/format-list-location";

describe("formatProductListLocationLabel", () => {
  it("시·동을 한 줄로 표시한다", () => {
    expect(
      formatProductListLocationLabel({
        regionCity: "부산",
        regionDong: "초량동",
      })
    ).toBe("부산시 초량동");
  });

  it("시가 이미 붙어 있으면 중복하지 않는다", () => {
    expect(
      formatProductListLocationLabel({
        regionCity: "성남시",
        regionDong: "판교동",
      })
    ).toBe("성남시 판교동");
  });
});

describe("formatProductListLocationDong", () => {
  it("동만 반환한다", () => {
    expect(formatProductListLocationDong("  초량동 ")).toBe("초량동");
  });
});
