import { cookies } from "next/headers";

import { authOptions } from "@/lib/auth/options";

function isSecureNextAuthCookieEnv(): boolean {
  return authOptions.useSecureCookies ?? process.env.NODE_ENV === "production";
}

/** Auth.js JWT session cookie — logout BFF에서 서버 측 정리 */
export async function clearNextAuthSession() {
  const store = await cookies();
  const secure = isSecureNextAuthCookieEnv();
  const names = secure
    ? [
        "__Secure-next-auth.session-token",
        "__Secure-next-auth.callback-url",
        "__Host-next-auth.csrf-token",
      ]
    : [
        "next-auth.session-token",
        "next-auth.callback-url",
        "next-auth.csrf-token",
      ];

  for (const name of names) {
    store.delete({ name, path: "/" });
  }
}
