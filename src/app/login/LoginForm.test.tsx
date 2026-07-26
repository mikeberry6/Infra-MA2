import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

  it("completes a successful sign-in with the returned document URL", async () => {
    const navigate = vi.fn();
    mocks.signIn.mockResolvedValue({
      error: null,
      status: 200,
      ok: true,
      url: "/Infra-MA2/admin?from=login",
    });
    const { LoginForm } = await import("./LoginForm");

    render(<LoginForm callbackUrl="/Infra-MA2/admin" navigate={navigate} />);
    await userEvent.type(screen.getByRole("textbox", { name: "Email address" }), "admin@example.com");
    await userEvent.type(screen.getByLabelText("Password"), "strong-test-password");
    await userEvent.click(screen.getByRole("button", { name: "Sign In" }));

    expect(mocks.signIn).toHaveBeenCalledWith("credentials", {
      email: "admin@example.com",
      password: "strong-test-password",
      redirect: false,
      callbackUrl: "/Infra-MA2/admin",
    });
    expect(navigate).toHaveBeenCalledWith("/Infra-MA2/admin?from=login");
  });
});
