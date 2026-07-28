import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      accessToken: string;
      refreshToken?: string;
      uuid: string;
      logInId: string;
      name: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    accessToken: string;
    refreshToken?: string;
    uuid: string;
    logInId: string;
    name: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    uuid?: string;
    logInId?: string;
    name?: string;
  }
}
