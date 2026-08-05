import type { NextAuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { applyResponseCookies } from "@/lib/auth/cookie-store";
import { getApiUrl } from "@/lib/api/client";
import type { ApiSignInResponse } from "@/types/auth/api";

/**
 * Auth.js JWT 세션 — memberUuid, nickname, role 만 보관.
 * Access/Refresh JWT는 HttpOnly Cookie(vh_*) — NextAuth payload에 넣지 않음.
 */
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        logInId: { label: "logInId", type: "text" },
        password: { label: "password", type: "password" },
      },
      async authorize(credentials): Promise<User | null> {
        if (!credentials?.logInId || !credentials?.password) return null;

        try {
          const res = await fetch(`${getApiUrl()}/api/v1/auth/sign-in`, {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              logInId: credentials.logInId,
              password: credentials.password,
            }),
            cache: "no-store",
          });

          if (!res.ok) return null;

          await applyResponseCookies(res);
          const data = (await res.json()) as ApiSignInResponse;

          return {
            id: data.memberUuid,
            memberUuid: data.memberUuid,
            nickname: data.nickname,
            role: data.role,
          };
        } catch (error) {
          console.error("authorize failed:", error);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.memberUuid = user.memberUuid;
        token.nickname = user.nickname;
        token.role = user.role;
      }
      return token;
    },

    async session({ session, token }) {
      session.user = {
        ...session.user,
        memberUuid: String(token.memberUuid ?? ""),
        nickname: String(token.nickname ?? ""),
        role: String(token.role ?? "USER"),
      };
      return session;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  useSecureCookies: process.env.NODE_ENV === "production",
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/signin",
  },
};
