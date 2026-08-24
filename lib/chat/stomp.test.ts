import { describe, expect, it, vi } from "vitest";

import {
  CHAT_STOMP_PROXY_PATH,
  httpToWsUrl,
  toBrowserStompBrokerUrl,
} from "@/lib/chat/stomp";

describe("httpToWsUrl", () => {
  it("maps https chat API to wss /ws-chat", () => {
    expect(httpToWsUrl("https://api.valuehub.art/chat-service")).toBe(
      "wss://api.valuehub.art/chat-service/ws-chat"
    );
  });
});

describe("toBrowserStompBrokerUrl", () => {
  it("turns the proxy path into a same-origin ws URL", () => {
    vi.stubGlobal("window", {
      location: {
        origin: "http://localhost:3000",
        hostname: "localhost",
        protocol: "http:",
      },
    });
    expect(toBrowserStompBrokerUrl(CHAT_STOMP_PROXY_PATH)).toBe(
      "ws://localhost:3000/api/chat/ws-chat"
    );
    vi.unstubAllGlobals();
  });
});
