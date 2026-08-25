import { describe, expect, it } from "vitest";

import { parseAdminRegionFromKakaoAddress } from "@/lib/kakao-maps/parse-admin-region";

describe("parseAdminRegionFromKakaoAddress", () => {
  it("parses dong and gu from address_name", () => {
    expect(
      parseAdminRegionFromKakaoAddress({
        address_name: "부산광역시 동구 초량동",
      })
    ).toEqual({ regionDong: "초량동", regionGu: "동구" });
  });

  it("prefers depth fields for dong/gu", () => {
    expect(
      parseAdminRegionFromKakaoAddress({
        address_name: "서울특별시 중구 회현동 1",
        region_2depth_name: "중구",
        region_3depth_name: "회현동",
      })
    ).toEqual({ regionDong: "회현동", regionGu: "중구" });
  });

  it("uses region_4 as dong when present", () => {
    expect(
      parseAdminRegionFromKakaoAddress({
        address_name: "경기도 성남시 분당구 판교동",
        region_2depth_name: "성남시",
        region_3depth_name: "분당구",
        region_4depth_name: "판교동",
      })
    ).toEqual({ regionDong: "판교동", regionGu: "분당구" });
  });
});
