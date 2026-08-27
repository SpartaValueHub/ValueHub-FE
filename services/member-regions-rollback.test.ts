import { describe, expect, it } from "vitest";

import {
  planVerifyFailRollback,
  type EnsureMemberRegionForVerifyResult,
} from "@/services/member-regions.service";

const baseRegion = {
  memberRegionId: 9,
  primary: false,
  regionCode: 100,
  regionName: "부산 초량동",
  verified: false,
  verifiedAt: null,
};

describe("planVerifyFailRollback", () => {
  it("deletes newly created region on fail", () => {
    const ensured: EnsureMemberRegionForVerifyResult = {
      region: baseRegion,
      mutation: "created",
    };
    expect(planVerifyFailRollback(ensured)).toEqual({
      kind: "delete",
      memberRegionId: 9,
    });
  });

  it("restores previous regionCode after failed change", () => {
    const ensured: EnsureMemberRegionForVerifyResult = {
      region: {
        ...baseRegion,
        memberRegionId: 1,
        primary: true,
        regionCode: 200,
        regionName: "서울 역삼동",
      },
      mutation: "changed",
      previousRegionCode: 100,
    };
    expect(planVerifyFailRollback(ensured)).toEqual({
      kind: "restore",
      memberRegionId: 1,
      previousRegionCode: 100,
    });
  });

  it("does nothing when existing row was only re-verified", () => {
    const ensured: EnsureMemberRegionForVerifyResult = {
      region: { ...baseRegion, memberRegionId: 1, primary: true },
      mutation: "none",
    };
    expect(planVerifyFailRollback(ensured)).toEqual({ kind: "noop" });
  });

  it("does nothing after set_primary-only ensure", () => {
    const ensured: EnsureMemberRegionForVerifyResult = {
      region: { ...baseRegion, memberRegionId: 1, primary: true },
      mutation: "set_primary",
    };
    expect(planVerifyFailRollback(ensured)).toEqual({ kind: "noop" });
  });
});
