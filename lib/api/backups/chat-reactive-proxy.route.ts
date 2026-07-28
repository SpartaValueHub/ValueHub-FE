/**
 * [BACKUP] Next.js SSE Proxy (미사용)
 * --------------------------------------------------
 * 이전: 브라우저 EventSource → /api/chat/reactive/[chatRoomUuid]
 *                         → CHAT_API_URL/api/v1/chat/reactive/{uuid}
 *
 * 현재: 브라우저가 EventSource로 CHAT API를 직접 구독합니다.
 * 복구 시 이 파일을
 *   app/api/chat/reactive/[chatRoomUuid]/route.ts
 * 로 복사한 뒤 hooks/useChatEventSource 를 프록시 URL로 되돌리세요.
 *
 * 원본 코드:
 *
 * import { openChatReactiveStream } from "@/lib/api/chat";
 * import { getAuthUser } from "@/lib/session";
 *
 * export const dynamic = "force-dynamic";
 * export const runtime = "nodejs";
 *
 * type RouteParams = {
 *   params: Promise<{ chatRoomUuid: string }>;
 * };
 *
 * export async function GET(_request: Request, { params }: RouteParams) {
 *   const user = await getAuthUser();
 *   if (!user) {
 *     return Response.json({ message: "로그인이 필요합니다." }, { status: 401 });
 *   }
 *
 *   const { chatRoomUuid } = await params;
 *
 *   let upstream: Response;
 *   try {
 *     upstream = await openChatReactiveStream(chatRoomUuid, user.accessToken);
 *   } catch (error) {
 *     const message =
 *       error instanceof Error ? error.message : "SSE 업스트림 연결 실패";
 *     return Response.json({ message }, { status: 502 });
 *   }
 *
 *   if (!upstream.ok || !upstream.body) {
 *     const detail = await upstream.text().catch(() => "");
 *     return Response.json(
 *       {
 *         message:
 *           detail ||
 *           `채팅 스트림 연결 실패 (${upstream.status} ${upstream.statusText})`,
 *       },
 *       { status: upstream.status || 502 }
 *     );
 *   }
 *
 *   return new Response(upstream.body, {
 *     headers: {
 *       "Content-Type": "text/event-stream; charset=utf-8",
 *       "Cache-Control": "no-cache, no-transform",
 *       Connection: "keep-alive",
 *       "X-Accel-Buffering": "no",
 *     },
 *   });
 * }
 */

export {};
