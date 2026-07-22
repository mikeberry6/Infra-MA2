import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  clearLoginThrottle,
  isLoginThrottled,
  recordFailedLogin,
  requestIp,
} from "@/modules/auth/throttle";

const DUMMY_PASSWORD_HASH = "$2b$12$jO.JJSOjJqs4/KuQ7eKiNe2n89mzPsIrPUQZq3FjGA4QTmutfH8Ci";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        if (!credentials?.email || !credentials?.password) return null;
        const email = credentials.email.trim().toLowerCase();
        const ip = requestIp(request.headers);

        if (await isLoginThrottled(email, ip)) {
          await bcrypt.compare(credentials.password, DUMMY_PASSWORD_HASH);
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email },
        });

        const isValid = await bcrypt.compare(
          credentials.password,
          user?.passwordHash ?? DUMMY_PASSWORD_HASH,
        );
        if (!user || !isValid) {
          await recordFailedLogin(email, ip);
          return null;
        }

        await clearLoginThrottle(email, ip);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role;
        session.user.id = token.id;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
