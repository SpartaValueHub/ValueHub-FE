import { describe, expect, it } from "vitest";

import {
  alignReservationMessage,
  formatChatDateLabel,
  isSameChatDay,
  mapChatMessage,
} from "@/lib/chat/map-message";
import type { ApiChatMessage } from "@/types/chat/api";
import type { UiChatMessage } from "@/types/chat/ui";

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

describe("formatChatDateLabel", () => {
  it("formats local calendar day as MM월 DD일 요일", () => {
    expect(formatChatDateLabel("2026-08-27T12:00:00.000Z")).toMatch(
      /^08월 27일 /
    );
  });

  it("returns empty string for invalid date", () => {
    expect(formatChatDateLabel("not-a-date")).toBe("");
  });
});

describe("isSameChatDay", () => {
  it("is true for the same local calendar day", () => {
    expect(
      isSameChatDay("2026-08-27T01:00:00.000Z", "2026-08-27T10:00:00.000Z")
    ).toBe(true);
  });

  it("is false when a timestamp is missing", () => {
    expect(isSameChatDay("2026-08-27T12:00:00.000Z")).toBe(false);
  });
});

describe("alignReservationMessage", () => {
  const notice: UiChatMessage = {
    id: "r1",
    kind: "system-reservation",
    from: "me",
    time: "오전 2:04",
    createdAt: "2026-08-26T17:04:00.000Z",
    reservationSummary: {
      dateLine: "거래가 예약되었습니다.",
      timePlaceLine: "오후 6:00 스마일맨션 나동",
    },
  };

  it("keeps reservation as me for the seller", () => {
    expect(alignReservationMessage(notice, true).from).toBe("me");
  });

  it("treats reservation as peer for the buyer", () => {
    expect(alignReservationMessage(notice, false).from).toBe("peer");
  });
});
