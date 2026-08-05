import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      memberUuid: string;
      nickname: string;
      role: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    memberUuid: string;
    nickname: string;
    role: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    memberUuid?: string;
    nickname?: string;
    role?: string;
  }
}
