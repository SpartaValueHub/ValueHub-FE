import { cookies } from "next/headers";

/** Auth.js JWT session cookie — logout BFF에서 서버 측 정리 */
export async function clearNextAuthSession() {
  const store = await cookies();
  const secure = process.env.NODE_ENV === "production";
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
