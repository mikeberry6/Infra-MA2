import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  authBasePath: vi.fn(),
  signIn: vi.fn(),
}));

vi.mock("next-auth/react", () => ({
  SessionProvider: ({
    basePath,
    children,
  }: {
    basePath?: string;
    children: ReactNode;
  }) => {
    mocks.authBasePath(basePath);
    return children;
  },
  signIn: mocks.signIn,
}));

describe("LoginForm NextAuth endpoint", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("configures the client on the full application base-path endpoint", async () => {
    vi.stubEnv("NEXT_PUBLIC_BASE_PATH", "/Infra-MA2");
    vi.resetModules();
    const { LoginForm } = await import("./LoginForm");

    render(<LoginForm callbackUrl="/Infra-MA2/admin" />);

    expect(screen.getByRole("button", { name: "Sign In" })).toBeVisible();
    expect(mocks.authBasePath).toHaveBeenCalledWith("/Infra-MA2/api/auth");
  });
});
