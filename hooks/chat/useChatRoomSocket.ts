"use client";

import { useEffect, useRef, useState } from "react";
import { Client, type IMessage } from "@stomp/stompjs";

import {
  createBrowserStompClient,
  fetchBrowserStompConfig,
} from "@/lib/chat/browser-stomp";
import { parseChatListPatch } from "@/lib/chat/map-list-patch";
import { mapChatMessage } from "@/lib/chat/map-message";
import { CHAT_LIST_QUEUE } from "@/lib/chat/stomp";
import type { UiLocationSelection } from "@/lib/kakao-maps";
import type { ApiChatListPatch, ApiChatMessage } from "@/types/chat/api";
import type { UiChatMessage } from "@/types/chat/ui";

function parseRoomMessage(frame: IMessage): ApiChatMessage | null {
  try {
    const body = JSON.parse(frame.body) as ApiChatMessage;
    if (!body?.messageId || !body.senderUuid) return null;
    return body;
  } catch {
    return null;
  }
}

export function useChatRoomSocket({
  roomId,
  onMessage,
  onListPatch,
}: {
  roomId: string;
  onMessage: (message: UiChatMessage) => void;
  onListPatch?: (patch: ApiChatListPatch) => void;
}) {
  const [connected, setConnected] = useState(false);
  const clientRef = useRef<Client | null>(null);
  const onMessageRef = useRef(onMessage);
  const onListPatchRef = useRef(onListPatch);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    onListPatchRef.current = onListPatch;
  }, [onListPatch]);

  useEffect(() => {
    if (!roomId) return;

    let cancelled = false;
    let client: Client | null = null;

    async function connect() {
      const config = await fetchBrowserStompConfig();
      if (cancelled || !config) return;

      const viewerUuid = config.memberUuid;
      client = createBrowserStompClient(config, {
        onConnect: (stomp) => {
          if (cancelled) return;
          stomp.subscribe(`/topic/chat.${roomId}`, (frame: IMessage) => {
            const api = parseRoomMessage(frame);
            if (!api) return;
            onMessageRef.current(mapChatMessage(api, viewerUuid));
          });
          stomp.subscribe(CHAT_LIST_QUEUE, (frame: IMessage) => {
            const patch = parseChatListPatch(frame.body);
            if (patch) onListPatchRef.current?.(patch);
          });
          stomp.subscribe("/user/queue/errors", () => {
            /* 전송 실패 — 말풍선은 topic echo만 그린다 */
          });
          setConnected(true);
        },
        onDisconnected: () => setConnected(false),
      });
      clientRef.current = client;
      client.activate();
    }

    connect();

    return () => {
      cancelled = true;
      clientRef.current = null;
      void client?.deactivate();
    };
  }, [roomId]);

  function publishText(content: string) {
    const stomp = clientRef.current;
    const text = content.trim();
    if (!stomp?.connected || !text) return false;
    stomp.publish({
      destination: `/app/chat.${roomId}`,
      body: JSON.stringify({
        messageType: "TEXT",
        content: text,
        metadata: null,
      }),
    });
    return true;
  }

  function publishLocation(selection: UiLocationSelection) {
    const stomp = clientRef.current;
    const placeName = selection.placeName.trim();
    if (!stomp?.connected || !placeName) return false;
    stomp.publish({
      destination: `/app/chat.${roomId}`,
      body: JSON.stringify({
        messageType: "LOCATION",
        content: placeName,
        metadata: {
          placeName,
          latitude: selection.latitude,
          longitude: selection.longitude,
        },
      }),
    });
    return true;
  }

  function publishImage(s3Key: string) {
    const stomp = clientRef.current;
    const key = s3Key.trim();
    if (!stomp?.connected || !key) return false;
    stomp.publish({
      destination: `/app/chat.${roomId}`,
      body: JSON.stringify({
        messageType: "IMAGE",
        content: key,
        metadata: null,
      }),
    });
    return true;
  }

  return { connected, publishText, publishLocation, publishImage };
}
