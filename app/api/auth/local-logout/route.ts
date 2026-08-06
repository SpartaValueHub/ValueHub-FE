import {
  clearAuthCookies,
  clearDuplicateLoginFlag,
} from "@/lib/auth/cookie-store";
import { clearNextAuthSession } from "@/lib/auth/nextauth-session";

/** duplicate login 모달 확인 — 로컬 Cookie·NextAuth·플래그만 정리 (백엔드 logout 호출 없음) */
export async function POST() {
  await clearAuthCookies();
  await clearDuplicateLoginFlag();
  await clearNextAuthSession();
  return Response.json({ ok: true });
}
