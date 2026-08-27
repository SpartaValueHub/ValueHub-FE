import { describe, expect, it } from "vitest";

import {
  hasCompleteListCenter,
  parseListCenterSearchParams,
} from "@/lib/product-posts/list-center-params";

describe("parseListCenterSearchParams", () => {
  it("parses valid coordinates and memberRegionId", () => {
    expect(
      parseListCenterSearchParams({
        centerLatitude: "35.1159",
        centerLongitude: "129.0403",
        memberRegionId: "12",
      })
    ).toEqual({
      centerLatitude: 35.1159,
      centerLongitude: 129.0403,
      memberRegionId: 12,
    });
  });

  it("returns null for invalid coords", () => {
    expect(
      parseListCenterSearchParams({
        centerLatitude: "abc",
        centerLongitude: "129",
      })
    ).toEqual({
      centerLatitude: null,
      centerLongitude: 129,
      memberRegionId: null,
    });
  });
});

describe("hasCompleteListCenter", () => {
  it("requires both lat and lng", () => {
    expect(
      hasCompleteListCenter({
        centerLatitude: 1,
        centerLongitude: 2,
      })
    ).toBe(true);
    expect(
      hasCompleteListCenter({
        centerLatitude: 1,
        centerLongitude: null,
      })
    ).toBe(false);
  });
});
