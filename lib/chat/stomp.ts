export const CHAT_STOMP_PATH = "/ws-chat";

/** 브라우저 STOMP — 동일 출처 프록시. 원격 Gateway에는 쿠키가 안 붙는다. */
export const CHAT_STOMP_PROXY_PATH = "/api/chat/ws-chat";

export function httpToWsUrl(httpUrl: string) {
  const trimmed = httpUrl.replace(/\/$/, "");
  const ws = trimmed.replace(/^http:/, "ws:").replace(/^https:/, "wss:");
  return `${ws}${CHAT_STOMP_PATH}`;
}

/** 상대 경로·ws URL을 현재 페이지 출처 WebSocket URL로 만든다 */
export function toBrowserStompBrokerUrl(wsUrl: string) {
  if (typeof window === "undefined") return wsUrl;
  try {
    const url = new URL(wsUrl, window.location.origin);
    if (url.protocol === "http:") url.protocol = "ws:";
    if (url.protocol === "https:") url.protocol = "wss:";
    if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
      url.hostname = window.location.hostname;
    }
    return url.toString().replace(/\/$/, "");
  } catch {
    return wsUrl;
  }
}

/** LAN에서 CHAT URL이 localhost면 현재 페이지 호스트로 바꾼다 */
export function rewriteChatWsHost(wsUrl: string) {
  return toBrowserStompBrokerUrl(wsUrl);
}
