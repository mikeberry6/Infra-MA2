import NextAuth from "next-auth";
import type { NextRequest } from "next/server";
import { withServerOperation } from "@/lib/server-log";
import { authOptions } from "@/modules/auth/config";

const handler = NextAuth(authOptions);

type AuthRouteContext = {
  params: Promise<{ nextauth: string[] }>;
};

export async function GET(request: NextRequest, context: AuthRouteContext) {
  return withServerOperation(request, {
    route: "/api/auth/[...nextauth]",
    operation: "auth_get",
  }, () => handler(request, context));
}

export async function POST(request: NextRequest, context: AuthRouteContext) {
  return withServerOperation(request, {
    route: "/api/auth/[...nextauth]",
    operation: "auth_post",
  }, () => handler(request, context));
}
