import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { normalizeNextAuthRedirect } from "@/lib/base-path";
import { prisma } from "@/lib/prisma";
import { exceedsBcryptPasswordLimit } from "@/modules/auth/password-policy";

const DUMMY_PASSWORD_HASH = "$2b$12$jO.JJSOjJqs4/KuQ7eKiNe2n89mzPsIrPUQZq3FjGA4QTmutfH8Ci";
const INVALID_PASSWORD = "invalid-overlong-password";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const email = credentials.email.trim().toLowerCase();

        const user = await prisma.user.findUnique({
          where: { email },
        });

        const passwordExceedsLimit = exceedsBcryptPasswordLimit(credentials.password);
        const isValid = await bcrypt.compare(
          passwordExceedsLimit ? INVALID_PASSWORD : credentials.password,
          passwordExceedsLimit ? DUMMY_PASSWORD_HASH : user?.passwordHash ?? DUMMY_PASSWORD_HASH,
        );
        if (!user || passwordExceedsLimit || !isValid) return null;

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
    async redirect({ url, baseUrl }) {
      return normalizeNextAuthRedirect(url, baseUrl);
    },
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
