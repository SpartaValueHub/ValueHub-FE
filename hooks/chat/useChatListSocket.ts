"use client";

import { useEffect, useRef, useState } from "react";
import { Client, type IMessage } from "@stomp/stompjs";

import {
  createBrowserStompClient,
  fetchBrowserStompConfig,
} from "@/lib/chat/browser-stomp";
import { parseChatListPatch } from "@/lib/chat/map-list-patch";
import { CHAT_LIST_QUEUE } from "@/lib/chat/stomp";
import type { ApiChatListPatch } from "@/types/chat/api";

/** `/chat` 목록 — /user/queue/chat-list 한 줄 패치 */
export function useChatListSocket({
  onPatch,
}: {
  onPatch: (patch: ApiChatListPatch) => void;
}) {
  const [connected, setConnected] = useState(false);
  const onPatchRef = useRef(onPatch);

  useEffect(() => {
    onPatchRef.current = onPatch;
  }, [onPatch]);

  useEffect(() => {
    let cancelled = false;
    let client: Client | null = null;

    async function connect() {
      const config = await fetchBrowserStompConfig();
      if (cancelled || !config) return;

      client = createBrowserStompClient(config, {
        onConnect: (stomp) => {
          if (cancelled) return;
          stomp.subscribe(CHAT_LIST_QUEUE, (frame: IMessage) => {
            const patch = parseChatListPatch(frame.body);
            if (patch) onPatchRef.current(patch);
          });
          setConnected(true);
        },
        onDisconnected: () => setConnected(false),
      });
      client.activate();
    }

    connect();

    return () => {
      cancelled = true;
      void client?.deactivate();
    };
  }, []);

  return { connected };
}
