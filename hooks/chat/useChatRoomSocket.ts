"use client";

import { useEffect, useRef, useState } from "react";
import { Client, type IMessage } from "@stomp/stompjs";

import { mapChatMessage } from "@/lib/chat/map-message";
import { toBrowserStompBrokerUrl } from "@/lib/chat/stomp";
import type { UiLocationSelection } from "@/lib/kakao-maps";
import type { ApiChatMessage } from "@/types/chat/api";
import type { UiChatMessage } from "@/types/chat/ui";

type StompConfig = {
  wsUrl: string;
  memberUuid: string;
};

function parseMessage(frame: IMessage): ApiChatMessage | null {
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
}: {
  roomId: string;
  onMessage: (message: UiChatMessage) => void;
}) {
  const [connected, setConnected] = useState(false);
  const clientRef = useRef<Client | null>(null);
  const onMessageRef = useRef(onMessage);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!roomId) return;

    let cancelled = false;
    let client: Client | null = null;

    async function connect() {
      const res = await fetch("/api/chat/stomp", { cache: "no-store" });
      if (!res.ok) return;
      const config = (await res.json()) as StompConfig;
      if (cancelled || !config.wsUrl || !config.memberUuid) return;

      const viewerUuid = config.memberUuid;
      const broker = new URL(toBrowserStompBrokerUrl(config.wsUrl));
      broker.searchParams.set("X-Member-Uuid", viewerUuid);
      client = new Client({
        brokerURL: broker.toString(),
        connectHeaders: { "X-Member-Uuid": viewerUuid },
        reconnectDelay: 4000,
        onConnect: () => {
          if (cancelled) return;
          client?.subscribe(`/topic/chat.${roomId}`, (frame: IMessage) => {
            const api = parseMessage(frame);
            if (!api) return;
            onMessageRef.current(mapChatMessage(api, viewerUuid));
          });
          client?.subscribe("/user/queue/errors", () => {
            /* 전송 실패 — 말풍선은 topic echo만 그린다 */
          });
          setConnected(true);
        },
        onDisconnect: () => {
          setConnected(false);
        },
        onWebSocketClose: () => {
          setConnected(false);
        },
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

  return { connected, publishText, publishLocation };
}
