import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { normalizeNextAuthRedirect } from "@/lib/base-path";
import { prisma } from "@/lib/prisma";
import { logServerOperation } from "@/lib/server-log";
import {
  clearLoginThrottle,
  isLoginThrottled,
  recordFailedLogin,
  requestIp,
} from "@/modules/auth/throttle";
import { PRIVILEGED_SESSION_MAX_AGE_SECONDS } from "@/modules/auth/session";

const DUMMY_PASSWORD_HASH = "$2b$12$jO.JJSOjJqs4/KuQ7eKiNe2n89mzPsIrPUQZq3FjGA4QTmutfH8Ci";

export const authOptions: NextAuthOptions = {
  logger: {
    error() {
      // NextAuth metadata can contain adapter exceptions. The route wrapper
      // records request status; keep library diagnostics payload-free too.
      logServerOperation({
        task: "nextauth",
        operation: "auth_library_error",
        durationMs: 0,
        status: 500,
        errorClassification: "internal_error",
      });
    },
    warn() {
      logServerOperation({
        task: "nextauth",
        operation: "auth_library_warning",
        durationMs: 0,
        status: 400,
        errorClassification: "validation_error",
      });
    },
    debug() {
      // Debug metadata is intentionally not emitted in production logs.
    },
  },
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
          authVersion: user.updatedAt.getTime(),
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
        token.authVersion = user.authVersion;
        token.authenticatedAt = Date.now();
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role;
        session.user.id = token.id;
        session.user.authVersion = token.authVersion;
        session.user.authenticatedAt = token.authenticatedAt;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: PRIVILEGED_SESSION_MAX_AGE_SECONDS,
  },
  jwt: { maxAge: PRIVILEGED_SESSION_MAX_AGE_SECONDS },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
