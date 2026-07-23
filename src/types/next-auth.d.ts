import { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      roles: { name: string }[];
      schoolId: string;
      schoolName: string;
      mustChangePassword: boolean;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    roles?: { name: string }[];
    schoolId?: string;
    schoolName?: string;
    mustChangePassword?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id?: string;
    roles?: { name: string }[];
    schoolId?: string;
    schoolName?: string;
    mustChangePassword?: boolean;
  }
}
