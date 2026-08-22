import {
  ApiError,
  ApiTimeoutError,
  AuthSessionExpiredError,
} from "@/lib/api/client";
import { logSafeError } from "@/lib/log/safe-log";
import { getAuthUser } from "@/lib/session";
import { createChatRoomService } from "@/services/chat.service";

export const dynamic = "force-dynamic";

function toMessage(error: unknown) {
  if (error instanceof ApiTimeoutError) {
    return "서버 응답이 지연되고 있습니다. 잠시 후 다시 시도해 주세요.";
  }
  if (error instanceof AuthSessionExpiredError) {
    return error.message;
  }
  if (error instanceof ApiError) {
    if (error.code === "CANNOT_CHAT_WITH_SELF") {
      return "자신의 게시글과는 채팅할 수 없습니다.";
    }
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return "채팅방을 만들지 못했습니다.";
}

/** 상품 상세 채팅하기 — Chat `POST /api/v1/chat/rooms` BFF */
export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) {
    return Response.json(
      { ok: false, message: "로그인이 필요합니다." },
      { status: 401 }
    );
  }

  let body: {
    productPostUuid?: string;
    sellerUuid?: string;
    sellerNickname?: string;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return Response.json(
      { ok: false, message: "요청이 올바르지 않습니다." },
      { status: 400 }
    );
  }

  try {
    const data = await createChatRoomService({
      productPostUuid: body.productPostUuid ?? "",
      sellerUuid: body.sellerUuid ?? "",
      sellerNickname: body.sellerNickname ?? "",
    });
    return Response.json({ ok: true, data });
  } catch (error) {
    logSafeError("Create chat room failed:", error);
    const status = error instanceof ApiError ? error.status : 502;
    return Response.json({ ok: false, message: toMessage(error) }, { status });
  }
}
