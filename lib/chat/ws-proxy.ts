import http from "node:http";
import https from "node:https";
import type { Duplex } from "node:stream";

import { AUTH_COOKIE_ACCESS } from "@/lib/auth/cookies";
import { CHAT_STOMP_PATH, CHAT_STOMP_PROXY_PATH } from "@/lib/chat/stomp";
import { logSafeError } from "@/lib/log/safe-log";

export { CHAT_STOMP_PROXY_PATH };

const HOP_BY_HOP = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "transfer-encoding",
  "upgrade",
  "host",
]);

let installed = false;

export function parseCookieValue(
  cookieHeader: string | undefined,
  name: string
): string | undefined {
  if (!cookieHeader) return undefined;
  for (const part of cookieHeader.split(";")) {
    const trimmed = part.trim();
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    if (trimmed.slice(0, eq) === name) {
      return trimmed.slice(eq + 1);
    }
  }
  return undefined;
}

export function buildChatWsTargetUrl(chatApiBase: string, incomingUrl: string) {
  const target = new URL(`${chatApiBase.replace(/\/$/, "")}${CHAT_STOMP_PATH}`);
  const incoming = new URL(incomingUrl, "http://local.invalid");
  incoming.searchParams.forEach((value, key) => {
    target.searchParams.set(key, value);
  });
  return target;
}

function chatApiBase() {
  const raw = process.env.CHAT_API_URL || "http://localhost:8000/chat-service";
  return raw.replace(/\/$/, "");
}

function isChatWsPath(url: string | undefined) {
  const pathname = (url ?? "").split("?")[0] ?? "";
  return (
    pathname === CHAT_STOMP_PROXY_PATH ||
    pathname.startsWith(`${CHAT_STOMP_PROXY_PATH}/`)
  );
}

function outboundHeaders(
  req: http.IncomingMessage,
  target: URL,
  accessToken: string
): http.OutgoingHttpHeaders {
  const headers: http.OutgoingHttpHeaders = {};
  for (const [key, value] of Object.entries(req.headers)) {
    const lower = key.toLowerCase();
    if (value == null || HOP_BY_HOP.has(lower) || lower === "cookie") continue;
    headers[key] = value;
  }
  headers.host = target.host;
  headers.connection = "Upgrade";
  headers.upgrade = "websocket";
  headers.authorization = `Bearer ${accessToken}`;
  return headers;
}

function writeClientError(socket: Duplex, status: number, reason: string) {
  socket.write(`HTTP/1.1 ${status} ${reason}\r\nConnection: close\r\n\r\n`);
  socket.destroy();
}

function proxyChatWsUpgrade(
  req: http.IncomingMessage,
  clientSocket: Duplex,
  head: Buffer
) {
  const accessToken = parseCookieValue(req.headers.cookie, AUTH_COOKIE_ACCESS);
  if (!accessToken) {
    writeClientError(clientSocket, 401, "Unauthorized");
    return;
  }

  let target: URL;
  try {
    target = buildChatWsTargetUrl(chatApiBase(), req.url ?? "/");
  } catch (error) {
    logSafeError("Chat WS proxy target URL failed:", error);
    writeClientError(clientSocket, 502, "Bad Gateway");
    return;
  }

  const isTls = target.protocol === "https:";
  const requestFn = isTls ? https.request : http.request;
  const proxyReq = requestFn({
    protocol: target.protocol,
    hostname: target.hostname,
    port: target.port || (isTls ? 443 : 80),
    path: `${target.pathname}${target.search}`,
    method: "GET",
    headers: outboundHeaders(req, target, accessToken),
  });

  proxyReq.on("upgrade", (proxyRes, proxySocket, proxyHead) => {
    const status = proxyRes.statusCode ?? 101;
    const lines = [`HTTP/1.1 ${status} Switching Protocols`];
    for (const [key, value] of Object.entries(proxyRes.headers)) {
      if (value == null) continue;
      const rendered = Array.isArray(value) ? value.join(", ") : value;
      lines.push(`${key}: ${rendered}`);
    }
    clientSocket.write(`${lines.join("\r\n")}\r\n\r\n`);
    if (head.length > 0) proxySocket.write(head);
    if (proxyHead.length > 0) clientSocket.write(proxyHead);
    proxySocket.pipe(clientSocket);
    clientSocket.pipe(proxySocket);
    proxySocket.on("error", () => clientSocket.destroy());
    clientSocket.on("error", () => proxySocket.destroy());
  });

  proxyReq.on("response", (res) => {
    const status = res.statusCode ?? 502;
    const reason = res.statusMessage || "Bad Gateway";
    clientSocket.write(`HTTP/1.1 ${status} ${reason}\r\n`);
    for (const [key, value] of Object.entries(res.headers)) {
      if (value == null || key.toLowerCase() === "www-authenticate") continue;
      const rendered = Array.isArray(value) ? value.join(", ") : value;
      clientSocket.write(`${key}: ${rendered}\r\n`);
    }
    clientSocket.write("Connection: close\r\n\r\n");
    res.pipe(clientSocket);
  });

  proxyReq.on("error", (error) => {
    logSafeError("Chat WS proxy upstream failed:", error);
    writeClientError(clientSocket, 502, "Bad Gateway");
  });

  proxyReq.end();
}

/** next dev / next start Node 서버의 upgrade를 가로채 Gateway STOMP로 넘긴다. */
export function installChatWsProxy() {
  if (installed) return;
  installed = true;

  const originalEmit = http.Server.prototype.emit;
  http.Server.prototype.emit = function (
    this: http.Server,
    event: string | symbol,
    ...args: unknown[]
  ) {
    if (event === "upgrade" && args.length >= 2) {
      const req = args[0] as http.IncomingMessage;
      if (isChatWsPath(req.url)) {
        const socket = args[1] as Duplex;
        const head = (args[2] as Buffer | undefined) ?? Buffer.alloc(0);
        proxyChatWsUpgrade(req, socket, head);
        return true;
      }
    }
    return originalEmit.call(this, event, ...args);
  };
}
