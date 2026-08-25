"use client";

import type { Dispatch, SetStateAction } from "react";

import { getChatRoomAction } from "@/actions/chat";
import {
  applyChatListPatch,
  mergeRoomWithListPatch,
  needsChatRoomFetch,
} from "@/lib/chat/map-list-patch";
import { logSafeError } from "@/lib/log/safe-log";
import type { ApiChatListPatch } from "@/types/chat/api";
import type { UiChatRoom } from "@/types/chat/ui";

/** 이미 있는 방이면 한 줄 패치. 없으면 패치 메타로 insert하거나 GET /rooms/{id} */
export function ingestChatListPatch(
  patch: ApiChatListPatch,
  setRooms: Dispatch<SetStateAction<UiChatRoom[]>>,
  options: { activeRoomId?: string; fetching: Set<string> } = {
    fetching: new Set(),
  }
) {
  let shouldFetch = false;
  setRooms((current) => {
    if (needsChatRoomFetch(current, patch)) {
      shouldFetch = true;
      return current;
    }
    return applyChatListPatch(current, patch, {
      activeRoomId: options.activeRoomId,
    });
  });

  if (!shouldFetch) return;
  const roomId = patch.roomId;
  if (options.fetching.has(roomId)) return;
  options.fetching.add(roomId);

  void getChatRoomAction(roomId)
    .then((result) => {
      if (!result.ok) return;
      setRooms((current) => {
        if (current.some((room) => room.id === roomId)) {
          return applyChatListPatch(current, patch, {
            activeRoomId: options.activeRoomId,
          });
        }
        const row = mergeRoomWithListPatch(result.data, patch, {
          activeRoomId: options.activeRoomId,
        });
        return [row, ...current];
      });
    })
    .catch((error) => {
      logSafeError("Chat list new room fetch failed:", error);
    })
    .finally(() => {
      options.fetching.delete(roomId);
    });
}
