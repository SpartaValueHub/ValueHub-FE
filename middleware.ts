import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

/**
 * Auth.js 세션 기반 라우트 보호 — matcher 확장 가능.
 * HttpOnly JWT 쿠키는 Gateway가 검증; middleware는 Auth.js 세션만 확인.
 */
const PUBLIC_PATHS = ["/signin", "/signup"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // 보호 라우트 matcher에 포함된 경로만 세션 확인 (현재는 스켈레톤)
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  });

  if (!token?.memberUuid) {
    const signInUrl = new URL("/signin", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // 향후 보호 라우트 추가 예: "/chat/:path*", "/api/chat/:path*"
  ],
};
