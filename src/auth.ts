import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const {
  handlers,
  signIn,
  signOut,
  auth,
} = NextAuth({
  trustHost: true,
  adapter: PrismaAdapter(prisma),
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
                  role: { select: { name: true } },
                },
              },
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
            roles: user.roles.map((r) => ({ name: r.role.name })),
            schoolId: user.schoolId || undefined,
          };
        } catch (error) {
          console.error("[AUTH] Database error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "database",
    maxAge: 24 * 60 * 60,
  },
  callbacks: {
    async session({ session, user }) {
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: {
          roles: {
            include: {
              role: { select: { name: true } },
            },
          },
        },
      });

      session.user.id = user.id;
      (session.user as any).roles = dbUser?.roles.map((r) => ({ name: r.role.name })) || [];
      (session.user as any).schoolId = dbUser?.schoolId || undefined;
      (session.user as any).mustChangePassword = (dbUser as any)?.mustChangePassword || false;
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
});
