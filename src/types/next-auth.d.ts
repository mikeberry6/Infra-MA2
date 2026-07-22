import "next-auth";

declare module "next-auth" {
  interface User {
    role: string;
    authVersion: number;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      role: string;
      authVersion: number;
      authenticatedAt: number;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string;
    id: string;
    authVersion: number;
    authenticatedAt: number;
  }
}
