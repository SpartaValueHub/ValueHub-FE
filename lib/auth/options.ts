import type { NextAuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { signInUserForAuthorize } from "@/lib/api/auth.authorize";
import { ApiError, ApiTimeoutError } from "@/lib/api/client";
import { clearAuthCookies } from "@/lib/auth/cookie-store";
import {
  SIGNUP_INCOMPLETE_ERROR_CODE,
  isSecurityStoreUnavailableApiError,
  securityStoreUnavailablePayload,
} from "@/lib/auth/signin-errors";
import { logSafeError } from "@/lib/log/safe-log";
import { getMyMemberProfileService } from "@/services/member.service";

type AuthorizeCredentials = {
  logInId?: string;
  password?: string;
  captchaToken?: string;
};

/**
 * Auth.js JWT — memberUuid·role은 token에만 보관 (서버/getToken용).
 * session 콜백에는 nickname만 노출해 /api/auth/session 최소화를 맞춘다.
 * maxAge는 refresh token(14일)과 정렬.
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
    if (error instanceof ApiTimeoutError) {
      throw new Error(
        JSON.stringify({
          code: "AUTH_REQUEST_TIMEOUT",
          message: error.message,
        })
      );
    }
    if (
      error instanceof ApiError &&
      error.code === SIGNUP_INCOMPLETE_ERROR_CODE
    ) {
      await clearAuthCookies();
      throw new Error(
        JSON.stringify({
          code: SIGNUP_INCOMPLETE_ERROR_CODE,
          message: error.message,
        })
      );
    }
    if (
      error instanceof ApiError &&
      isSecurityStoreUnavailableApiError(error)
    ) {
      throw new Error(JSON.stringify(securityStoreUnavailablePayload()));
    }
    if (error instanceof Error && error.message.startsWith("{")) {
      throw error;
    }
    logSafeError("authorize failed:", error);
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
          logSafeError("authorize failed:", error);
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
      // memberUuid·role은 JWT token에만 유지 — /api/auth/session에는 nickname만
      session.user = {
        nickname: String(token.nickname ?? ""),
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
    // refresh token(JWT_REFRESH_TOKEN_DAYS=14)과 정렬 — NextAuth 세션이 더 길면 무효 refresh와 불일치
    maxAge: 14 * 24 * 60 * 60,
  },
  useSecureCookies: process.env.NODE_ENV === "production",
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/signin",
  },
};
