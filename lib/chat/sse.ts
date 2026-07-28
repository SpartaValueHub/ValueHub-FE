import { API_ENDPOINTS } from "@/lib/api/endpoints";

function isLoopbackHost(hostname: string) {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
}

/**
 * 브라우저 EventSource용 chat base URL.
 * 서버 CHAT_API_URL 과 동일 값을 NEXT_PUBLIC_CHAT_API_URL 로 노출합니다.
 * 다른 IP로 페이지에 접속한 경우 localhost 를 현재 hostname 으로 바꿉니다.
 */
export function getPublicChatApiUrl() {
  const raw =
    process.env.NEXT_PUBLIC_CHAT_API_URL ||
    process.env.CHAT_API_URL ||
    "http://localhost:8082";

  try {
    const url = new URL(raw);

    if (typeof window !== "undefined" && isLoopbackHost(url.hostname)) {
      const pageHost = window.location.hostname;
      if (!isLoopbackHost(pageHost)) {
        url.hostname = pageHost;
      }
    }

    return url.origin;
  } catch {
    return raw.replace(/\/$/, "");
  }
}

/**
 * EventSource는 Authorization 헤더를 설정할 수 없어
 * accessToken 을 query 로 전달합니다. (백엔드 지원 필요)
 */
export function buildChatReactiveEventSourceUrl(
  chatRoomUuid: string,
  accessToken?: string
) {
  const path = API_ENDPOINTS.chat.reactive(chatRoomUuid);
  const url = new URL(`${getPublicChatApiUrl()}${path}`);

  if (accessToken) {
    url.searchParams.set("accessToken", accessToken);
  }

  return url.toString();
}

/** 신규 메시지(change stream) 전용 — 채팅방 목록 미리보기 갱신 */
export function buildChatReactiveLatestEventSourceUrl(
  chatRoomUuid: string,
  accessToken?: string
) {
  const path = API_ENDPOINTS.chat.reactiveLatest(chatRoomUuid);
  const url = new URL(`${getPublicChatApiUrl()}${path}`);

  if (accessToken) {
    url.searchParams.set("accessToken", accessToken);
  }

  return url.toString();
}
