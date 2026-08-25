import { describe, expect, it } from "vitest";

import { mapChatImagePresigned } from "@/lib/chat/map-image-presign";

describe("mapChatImagePresigned", () => {
  it("maps uploadUrl and s3Key", () => {
    expect(
      mapChatImagePresigned({
        uploadUrl: "https://s3.example/put",
        s3Key: "chat/a.jpg",
      })
    ).toEqual({ uploadUrl: "https://s3.example/put", s3Key: "chat/a.jpg" });
  });

  it("accepts key alias", () => {
    expect(
      mapChatImagePresigned({
        uploadUrl: "https://s3.example/put",
        key: "chat/b.png",
      }).s3Key
    ).toBe("chat/b.png");
  });
});
