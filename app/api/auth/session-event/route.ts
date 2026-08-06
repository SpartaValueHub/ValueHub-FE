import {
  clearDuplicateLoginFlag,
  hasDuplicateLoginFlag,
  hasSessionMaterial,
} from "@/lib/auth/cookie-store";
import { probeDuplicateLoginSession } from "@/lib/auth/session-probe";

/** duplicate login 감지 — 플래그 우선, Gateway session ping·refresh probe */
export async function GET() {
  const sessionMaterial = await hasSessionMaterial();

  if (await hasDuplicateLoginFlag()) {
    return Response.json({
      duplicateLogin: true,
      hasSessionMaterial: sessionMaterial,
    });
  }

  if (!sessionMaterial) {
    return Response.json({
      duplicateLogin: false,
      hasSessionMaterial: false,
    });
  }

  let duplicateLogin = false;
  try {
    duplicateLogin = await probeDuplicateLoginSession();
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      const detail = err instanceof Error ? err.message : String(err);
      console.warn(
        `[session-event] Duplicate login probe failed; continuing polling (${detail})`
      );
    }
  }

  return Response.json({
    duplicateLogin,
    hasSessionMaterial: sessionMaterial,
  });
}

/** 모달 확인 후 플래그 정리 (local-logout에서도 clear) */
export async function DELETE() {
  await clearDuplicateLoginFlag();
  return Response.json({ ok: true });
}
