/** 브라우저 STOMP URL. localhost면 현재 페이지 hostname으로 치환 (LAN). */

export const CHAT_STOMP_PATH = "/ws-chat";

export function httpToWsUrl(httpUrl: string): string {
  const trimmed = httpUrl.replace(/\/$/, "");
  const ws = trimmed.replace(/^http:/i, "ws:").replace(/^https:/i, "wss:");
  return `${ws}${CHAT_STOMP_PATH}`;
}

export function rewriteChatWsHost(wsUrl: string, pageHostname: string): string {
  if (!pageHostname || pageHostname === "localhost") return wsUrl;
  try {
    const url = new URL(wsUrl);
    if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
      url.hostname = pageHostname;
    }
    return url.toString();
  } catch {
    return wsUrl;
  }
}
