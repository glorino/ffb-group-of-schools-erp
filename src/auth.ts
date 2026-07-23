import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const {
  handlers,
  signIn,
  signOut,
  auth,
} = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.error("[AUTH] No credentials provided");
          return null;
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string },
            include: {
              roles: {
                include: {
                  role: true,
                },
              },
              school: true,
            },
          });

          if (!user) {
            console.error("[AUTH] User not found:", credentials.email);
            return null;
          }

          if (!user.password) {
            console.error("[AUTH] User has no password:", credentials.email);
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          );

          if (!isPasswordValid) {
            console.error("[AUTH] Invalid password for:", credentials.email);
            return null;
          }

          await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
          });

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            mustChangePassword: (user as any).mustChangePassword || false,
            roles: user.roles.map((r) => ({
              name: r.role.name,
              level: r.role.level,
            })),
            schoolId: user.schoolId || undefined,
            schoolName: user.school?.name || undefined,
          };
        } catch (error) {
          console.error("[AUTH] Database error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = (user as any).id;
        token.roles = (user as any).roles;
        token.schoolId = (user as any).schoolId;
        token.schoolName = (user as any).schoolName;
        token.image = (user as any).image;
        token.mustChangePassword = (user as any).mustChangePassword;
      }
      if (trigger === "update" && session) {
        if (session.user?.image) token.image = session.user.image;
        if (session.user?.name) token.name = session.user.name;
        if (session.user?.email) token.email = session.user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        (session.user as any).roles = token.roles;
        (session.user as any).schoolId = token.schoolId;
        (session.user as any).schoolName = token.schoolName;
        if (token.image) session.user.image = token.image as string;
        (session.user as any).mustChangePassword = token.mustChangePassword;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
});
