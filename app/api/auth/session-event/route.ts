import {
  clearDuplicateLoginFlag,
  hasDuplicateLoginFlag,
  hasSessionMaterial,
} from "@/lib/auth/cookie-store";
import { AUTH_SESSION_TERMINATED } from "@/lib/auth/duplicate-login";
import { probeDuplicateLoginSession } from "@/lib/auth/session-probe";

/** duplicate login 감지 — HttpOnly 플래그 우선, Gateway session ping·refresh probe (mount/focus fallback) */
export async function GET() {
  const sessionMaterial = await hasSessionMaterial();

  if (await hasDuplicateLoginFlag()) {
    return Response.json({
      duplicateLogin: true,
      code: AUTH_SESSION_TERMINATED,
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
        `[session-event] Duplicate login probe failed; returning duplicateLogin=false (${detail})`
      );
    }
  }

  return Response.json({
    duplicateLogin,
    ...(duplicateLogin ? { code: AUTH_SESSION_TERMINATED } : {}),
    hasSessionMaterial: sessionMaterial,
  });
}

/** 모달 확인 후 플래그 정리 (local-logout에서도 clear) */
export async function DELETE() {
  await clearDuplicateLoginFlag();
  return Response.json({ ok: true });
}
