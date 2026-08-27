import { cookies } from "next/headers";
import { getToken } from "next-auth/jwt";

import { isSecureNextAuthCookieEnv } from "@/lib/auth/nextauth-session";
import type { ListProductPostsOptions } from "@/lib/api/product-posts";
import { SEARCH_SESSION_COOKIE } from "@/lib/search/session";

/**
 * 목록 keyword 검색 시 동시검색 헤더.
 * Gateway public GET은 JWT 체인을 안 타서 X-Member-Uuid가 주입되지 않음 →
 * 서버에서 NextAuth token / 검색 세션 쿠키로 전달.
 */
export async function resolveSearchCoOccurrenceHeaders(): Promise<ListProductPostsOptions> {
  const cookieStore = await cookies();
  const searchSessionId = cookieStore.get(SEARCH_SESSION_COOKIE)?.value?.trim();

  let searcherMemberUuid: string | undefined;
  try {
    const token = await getToken({
      req: {
        cookies: cookieStore,
      } as unknown as Parameters<typeof getToken>[0]["req"],
      secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
      secureCookie: isSecureNextAuthCookieEnv(),
    });
    const uuid =
      typeof token?.memberUuid === "string" ? token.memberUuid.trim() : "";
    if (uuid) searcherMemberUuid = uuid;
  } catch {
    // 세션 파싱 실패 시 헤더 없이 검색만 진행
  }

  return {
    searcherMemberUuid,
    searchSessionId: searchSessionId || undefined,
  };
}
