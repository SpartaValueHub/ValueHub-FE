import { describe, expect, it } from "vitest";

import { mapChatMessage } from "@/lib/chat/map-message";
import type { ApiChatMessage } from "@/types/chat/api";

const me = "viewer-uuid";

function base(overrides: Partial<ApiChatMessage>): ApiChatMessage {
  return {
    messageId: "m1",
    senderUuid: me,
    messageType: "TEXT",
    content: "",
    createdAt: "2026-08-24T08:00:00.000Z",
    ...overrides,
  };
}

describe("mapChatMessage IMAGE", () => {
  it("maps IMAGE content as CloudFront src", () => {
    const ui = mapChatMessage(
      base({
        messageType: "IMAGE",
        content: "https://cdn.example/chat/a.jpg",
      }),
      me
    );
    expect(ui).toMatchObject({
      kind: "image",
      from: "me",
      imageSrc: "https://cdn.example/chat/a.jpg",
    });
  });
});

describe("mapChatMessage LOCATION", () => {
  it("maps placeName and coordinates from metadata", () => {
    const ui = mapChatMessage(
      base({
        messageType: "LOCATION",
        content: "부산역",
        metadata: {
          placeName: "부산역 1번출구",
          latitude: 35.115,
          longitude: 129.04,
        },
      }),
      me
    );
    expect(ui).toMatchObject({
      kind: "location",
      from: "me",
      placeName: "부산역 1번출구",
      latitude: 35.115,
      longitude: 129.04,
    });
  });
});
