import { Client } from "@stomp/stompjs";

import { toBrowserStompBrokerUrl } from "@/lib/chat/stomp";

export type BrowserStompConfig = {
  wsUrl: string;
  memberUuid: string;
};

export async function fetchBrowserStompConfig(): Promise<BrowserStompConfig | null> {
  const res = await fetch("/api/chat/stomp", { cache: "no-store" });
  if (!res.ok) return null;
  const config = (await res.json()) as BrowserStompConfig;
  if (!config.wsUrl || !config.memberUuid) return null;
  return config;
}

export function createBrowserStompClient(
  config: BrowserStompConfig,
  handlers: {
    onConnect: (client: Client, memberUuid: string) => void;
    onDisconnected: () => void;
  }
) {
  const broker = new URL(toBrowserStompBrokerUrl(config.wsUrl));
  broker.searchParams.set("X-Member-Uuid", config.memberUuid);
  const client = new Client({
    brokerURL: broker.toString(),
    connectHeaders: { "X-Member-Uuid": config.memberUuid },
    reconnectDelay: 4000,
    onConnect: () => handlers.onConnect(client, config.memberUuid),
    onDisconnect: handlers.onDisconnected,
    onWebSocketClose: handlers.onDisconnected,
  });
  return client;
}
