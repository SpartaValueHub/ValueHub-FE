import type { NextAuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { signInService } from "@/services/auth.service";

/**
 * NextAuth JWT 세션 — access/refresh token·authUuid는 서버(session/JWT)에만 보관.
 * 클라이언트 SessionContext는 /api/auth/status 로 name 만 노출.
 */
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        logInId: {
          label: "logInId",
          type: "text",
          placeholder: "logInId",
        },
        password: { label: "password", type: "password" },
      },
      async authorize(credentials): Promise<User | null> {
        if (!credentials?.logInId || !credentials?.password) return null;

        try {
          const result = await signInService({
            logInId: credentials.logInId,
            password: credentials.password,
          });

          // auth-service 응답 authUuid → NextAuth User.id / session.uuid
          return {
            id: result.authUuid,
            uuid: result.authUuid,
            logInId: result.logInId || credentials.logInId,
            name: result.memberName || result.logInId,
            email: result.email ?? result.logInId,
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
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
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.uuid = user.uuid;
        token.logInId = user.logInId;
        token.name = user.name;
      }
      return token;
    },

    async session({ session, token }) {
      session.user = {
        ...session.user,
        accessToken: String(token.accessToken ?? ""),
        refreshToken: token.refreshToken
          ? String(token.refreshToken)
          : undefined,
        uuid: String(token.uuid ?? ""),
        logInId: String(token.logInId ?? ""),
        name: String(token.name ?? session.user?.name ?? ""),
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
  // http + LAN IP 접속에서도 쿠키 발급 (NEXTAUTH_URL localhost 고정 금지)
  useSecureCookies: false,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/signin",
  },
};
