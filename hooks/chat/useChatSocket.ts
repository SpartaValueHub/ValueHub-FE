"use client";

import { Client, type IMessage } from "@stomp/stompjs";
import { useEffect, useRef } from "react";

import { rewriteChatWsHost } from "@/lib/chat/stomp";
import { mapChatMessage } from "@/lib/chat/map-ui";
import type { ApiChatListPreview, ApiChatMessage } from "@/types/chat/api";
import type { UiChatMessage } from "@/types/chat/ui";

type StompConfig = {
  wsUrl: string;
  memberUuid: string;
};

interface UseChatSocketOptions {
  roomId?: string;
  onMessage?: (message: UiChatMessage) => void;
  onListPreview?: (preview: ApiChatListPreview) => void;
}

export function useChatSocket({
  roomId,
  onMessage,
  onListPreview,
}: UseChatSocketOptions) {
  const onMessageRef = useRef(onMessage);
  const onPreviewRef = useRef(onListPreview);
  const viewerRef = useRef("");
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    onMessageRef.current = onMessage;
    onPreviewRef.current = onListPreview;
  });

  useEffect(() => {
    let cancelled = false;
    let client: Client | null = null;

    async function connect() {
      const res = await fetch("/api/chat/stomp", { cache: "no-store" });
      if (!res.ok) return;
      const config = (await res.json()) as StompConfig;
      if (cancelled || !config.wsUrl || !config.memberUuid) return;

      viewerRef.current = config.memberUuid;
      const wsUrl = rewriteChatWsHost(config.wsUrl, window.location.hostname);

      client = new Client({
        brokerURL: wsUrl,
        connectHeaders: { "X-Member-Uuid": config.memberUuid },
        reconnectDelay: 4_000,
        onConnect: () => {
          client?.subscribe("/user/queue/chat-list", (frame: IMessage) => {
            try {
              const preview = JSON.parse(frame.body) as ApiChatListPreview;
              onPreviewRef.current?.(preview);
            } catch {
              /* ignore */
            }
          });
          if (roomId) {
            client?.subscribe(`/topic/chat.${roomId}`, (frame: IMessage) => {
              try {
                const payload = JSON.parse(frame.body) as ApiChatMessage;
                onMessageRef.current?.(
                  mapChatMessage(payload, viewerRef.current)
                );
              } catch {
                /* ignore */
              }
            });
          }
        },
      });
      clientRef.current = client;
      client.activate();
    }

    void connect().catch(() => {
      /* 소켓 실패 시 이력 REST만 사용 */
    });

    return () => {
      cancelled = true;
      void client?.deactivate();
      clientRef.current = null;
    };
  }, [roomId]);

  function sendText(text: string) {
    const next = text.trim();
    if (!next || !roomId) return false;
    const stomp = clientRef.current;
    if (!stomp?.connected) return false;
    stomp.publish({
      destination: `/app/chat.${roomId}`,
      body: JSON.stringify({
        messageType: "TEXT",
        content: next,
        metadata: null,
      }),
    });
    return true;
  }

  return { sendText };
}
