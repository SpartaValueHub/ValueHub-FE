import { describe, expect, it } from "vitest";

import {
  applyChatListPatch,
  needsChatRoomHydrate,
  parseChatListPatch,
} from "@/lib/chat/map-list-patch";
import type { UiChatRoom } from "@/types/chat/ui";

const rooms: UiChatRoom[] = [
  {
    id: "a",
    title: "A",
    thumbnail: "/a.png",
    timeAgo: "1분 전",
    unreadCount: 0,
    peerName: "",
    price: 0,
    location: "",
    lastMessage: "안녕",
  },
  {
    id: "b",
    title: "B",
    thumbnail: "/b.png",
    timeAgo: "어제",
    unreadCount: 2,
    peerName: "",
    price: 0,
    location: "",
    lastMessage: "이전",
  },
];

describe("parseChatListPatch", () => {
  it("requires roomId", () => {
    expect(parseChatListPatch("{}")).toBeNull();
    expect(parseChatListPatch("{not json")).toBeNull();
  });

  it("accepts chatRoomId alias", () => {
    expect(parseChatListPatch(JSON.stringify({ chatRoomId: "a" }))).toEqual(
      expect.objectContaining({ roomId: "a" })
    );
  });
});

describe("applyChatListPatch", () => {
  it("marks existing rooms reserved when productPost.tradeStatus is RESERVED", () => {
    const next = applyChatListPatch(rooms, {
      roomId: "a",
      lastMessage: {
        content: "거래가 예약되었습니다",
        createdAt: new Date().toISOString(),
      },
      productPost: {
        productPostUuid: "p1",
        productPostImageUrl: "/a.png",
        productPostName: "A",
        price: 1000,
        tradeStatus: "RESERVED",
      },
    });
    expect(next[0]?.id).toBe("a");
    expect(next[0]?.reserved).toBe(true);
    expect(next[0]?.lastMessage).toBe("거래가 예약되었습니다");
  });

  it("clears unread when that room is open", () => {
    const next = applyChatListPatch(
      rooms,
      { roomId: "b", unreadCount: 9, content: "봄" },
      { activeRoomId: "b" }
    );
    expect(next[0]?.unreadCount).toBe(0);
    expect(next[0]?.lastMessage).toBe("봄");
  });

  it("inserts unknown rooms when productPost is present", () => {
    const next = applyChatListPatch(rooms, {
      roomId: "z",
      unreadCount: 1,
      lastMessage: {
        content: "첫 메시지",
        createdAt: new Date().toISOString(),
      },
      productPost: {
        productPostUuid: "p1",
        productPostImageUrl: "/z.png",
        productPostName: "새 상품",
        price: 1000,
        tradeStatus: "SELLING",
      },
    });
    expect(next[0]?.id).toBe("z");
    expect(next[0]?.title).toBe("새 상품");
    expect(next[0]?.lastMessage).toBe("첫 메시지");
    expect(next[0]?.unreadCount).toBe(1);
    expect(next).toHaveLength(3);
  });

  it("inserts unknown rooms without product snapshot as a stub", () => {
    const next = applyChatListPatch(rooms, {
      roomId: "z",
      unreadCount: 1,
      content: "첫 메시지",
    });
    expect(next[0]?.id).toBe("z");
    expect(next[0]?.lastMessage).toBe("첫 메시지");
    expect(next[0]?.unreadCount).toBe(1);
    expect(next).toHaveLength(3);
    expect(needsChatRoomHydrate(rooms, { roomId: "z", unreadCount: 1 })).toBe(
      true
    );
    expect(
      needsChatRoomHydrate(next, {
        roomId: "z",
        unreadCount: 1,
        productPost: {
          productPostUuid: "p1",
          productPostImageUrl: "/z.png",
          productPostName: "새 상품",
          price: 1000,
          tradeStatus: "SELLING",
        },
      })
    ).toBe(false);
  });
});
