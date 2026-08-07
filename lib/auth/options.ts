import type { NextAuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { signInUserForAuthorize } from "@/lib/api/auth.authorize";
import { getMyMemberProfileService } from "@/services/member.service";

type AuthorizeCredentials = {
  logInId?: string;
  password?: string;
  captchaToken?: string;
};

/**
 * Auth.js JWT 세션 — memberUuid, nickname, role 만 보관.
 * Access/Refresh JWT는 HttpOnly Cookie(vh_*) — NextAuth payload에 넣지 않음.
 */
export async function authorizeCredentials(
  credentials: AuthorizeCredentials | undefined
): Promise<User | null> {
  if (!credentials?.logInId || !credentials?.password) return null;

  try {
    const { cookieHeader, signIn } = await signInUserForAuthorize({
      logInId: credentials.logInId!,
      password: credentials.password!,
      captchaToken: credentials.captchaToken,
    });

    const member = await getMyMemberProfileService(
      cookieHeader ? { cookieHeader } : {}
    );

    return {
      id: signIn.memberUuid,
      memberUuid: signIn.memberUuid,
      nickname: member.nickname,
      role: signIn.role,
    };
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("{")) {
      throw error;
    }
    console.error("authorize failed:", error);
    return null;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        logInId: { label: "logInId", type: "text" },
        password: { label: "password", type: "password" },
        captchaToken: { label: "captchaToken", type: "text" },
      },
      async authorize(credentials): Promise<User | null> {
        if (!credentials?.logInId || !credentials?.password) return null;

        try {
          return await authorizeCredentials(credentials);
        } catch (error) {
          if (error instanceof Error && error.message.startsWith("{")) {
            throw error;
          }
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
