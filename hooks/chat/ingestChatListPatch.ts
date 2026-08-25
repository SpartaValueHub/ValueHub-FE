"use client";

import type { Dispatch, SetStateAction } from "react";

import { getChatRoomAction } from "@/actions/chat";
import {
  applyChatListPatch,
  canInsertChatListPatch,
} from "@/lib/chat/map-list-patch";
import { logSafeError } from "@/lib/log/safe-log";
import type { ApiChatListPatch } from "@/types/chat/api";
import type { UiChatRoom } from "@/types/chat/ui";

const HYDRATE_DELAYS_MS = [0, 400, 1000];

function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function fetchRoomForList(roomId: string) {
  for (const delay of HYDRATE_DELAYS_MS) {
    if (delay) await wait(delay);
    const result = await getChatRoomAction(roomId);
    if (result.ok) return result.data;
  }
  return null;
}

/** 이미 있는 방이면 한 줄 패치. 없으면 바로 insert하고, 제목은 GET /rooms/{id}로 채운다 */
export function ingestChatListPatch(
  patch: ApiChatListPatch,
  setRooms: Dispatch<SetStateAction<UiChatRoom[]>>,
  options: { activeRoomId?: string; fetching: Set<string> } = {
    fetching: new Set(),
  }
) {
  const patchOpts = { activeRoomId: options.activeRoomId };
  setRooms((current) => applyChatListPatch(current, patch, patchOpts));

  if (canInsertChatListPatch(patch)) return;
  const roomId = patch.roomId;
  if (options.fetching.has(roomId)) return;
  options.fetching.add(roomId);

  void fetchRoomForList(roomId)
    .then((room) => {
      if (!room) return;
      setRooms((current) => {
        const existing = current.find((item) => item.id === roomId);
        const without = current.filter((item) => item.id !== roomId);
        const row: UiChatRoom = {
          ...room,
          lastMessage: existing?.lastMessage ?? room.lastMessage,
          unreadCount: existing?.unreadCount ?? room.unreadCount,
          timeAgo: existing?.timeAgo || room.timeAgo || "방금 전",
        };
        return [row, ...without];
      });
    })
    .catch((error) => {
      logSafeError("Chat list new room fetch failed:", error);
    })
    .finally(() => {
      options.fetching.delete(roomId);
    });
}
