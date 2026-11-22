import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  signIn: vi.fn(),
}));

vi.mock("next-auth/react", () => ({
  signIn: mocks.signIn,
}));

describe("LoginForm", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("navigates to the sanitized URL returned after sign-in", async () => {
    const navigate = vi.fn();
    mocks.signIn.mockResolvedValue({
      error: null,
      status: 200,
      ok: true,
      url: "/admin?from=login",
    });
    const { LoginForm } = await import("./LoginForm");

    render(<LoginForm callbackUrl="/admin" navigate={navigate} />);
    await userEvent.type(screen.getByRole("textbox", { name: "Email address" }), "admin@example.com");
    await userEvent.type(screen.getByLabelText("Password"), "strong-test-password");
    await userEvent.click(screen.getByRole("button", { name: "Sign In" }));

    expect(mocks.signIn).toHaveBeenCalledWith("credentials", {
      email: "admin@example.com",
      password: "strong-test-password",
      redirect: false,
      callbackUrl: "/admin",
    });
    expect(navigate).toHaveBeenCalledWith("/admin?from=login");
  });

  it("recovers from a login network failure with the generic denial", async () => {
    mocks.signIn.mockRejectedValue(
      new Error("private adapter or network details"),
    );
    const { LoginForm } = await import("./LoginForm");

    render(<LoginForm callbackUrl="/admin" />);
    await userEvent.type(
      screen.getByRole("textbox", { name: "Email address" }),
      "admin@example.com",
    );
    await userEvent.type(screen.getByLabelText("Password"), "strong-test-password");
    await userEvent.click(screen.getByRole("button", { name: "Sign In" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "The email or password was not recognized.",
    );
    expect(screen.getByRole("button", { name: "Sign In" })).toBeEnabled();
  });
});
