import { describe, expect, it } from "vitest";

import { buildChatWsTargetUrl, parseCookieValue } from "@/lib/chat/ws-proxy";

describe("parseCookieValue", () => {
  it("reads the named cookie", () => {
    expect(
      parseCookieValue(
        "vh_refresh_token=r; vh_access_token=access-jwt",
        "vh_access_token"
      )
    ).toBe("access-jwt");
  });

  it("returns undefined when missing", () => {
    expect(parseCookieValue("other=1", "vh_access_token")).toBeUndefined();
    expect(parseCookieValue(undefined, "vh_access_token")).toBeUndefined();
  });
});

describe("buildChatWsTargetUrl", () => {
  it("appends /ws-chat and forwards query", () => {
    const target = buildChatWsTargetUrl(
      "https://api.valuehub.art/chat-service",
      "/api/chat/ws-chat?X-Member-Uuid=abc"
    );
    expect(target.origin).toBe("https://api.valuehub.art");
    expect(target.pathname).toBe("/chat-service/ws-chat");
    expect(target.searchParams.get("X-Member-Uuid")).toBe("abc");
  });
});
