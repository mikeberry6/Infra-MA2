import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import CompanyForm from "./CompanyForm";
import DealForm from "./DealForm";
import FundForm from "./FundForm";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

const action = vi.fn(async () => ({ success: true, id: "record-1" }));

function expectEveryFormControlLabelled(container: HTMLElement) {
  const controls = Array.from(container.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
    "input:not([type='checkbox']):not([type='hidden']), select, textarea",
  ));
  expect(controls.length).toBeGreaterThan(0);
  for (const control of controls) {
    expect(control.id, `${control.tagName} must have an id`).not.toBe("");
    expect(
      container.querySelector(`label[for="${CSS.escape(control.id)}"]`),
      `${control.id} must have an associated label`,
    ).not.toBeNull();
  }
}

describe("admin form accessibility", () => {
  it("associates every deal control with a visible label", () => {
    const { container } = render(<DealForm mode="create" action={action} />);
    expectEveryFormControlLabelled(container);
  });

  it("associates every fund control with a visible label", () => {
    const { container } = render(<FundForm mode="create" action={action} />);
    expectEveryFormControlLabelled(container);
  });

  it("associates every company control with a visible label", () => {
    const { container } = render(<CompanyForm mode="create" action={action} />);
    expectEveryFormControlLabelled(container);
  });

  it("hydrates an existing company primary citation during editing", () => {
    render(
      <CompanyForm
        mode="edit"
        action={action}
        initialData={{
          name: "Example Company",
          sources: [{ label: "Primary source", url: "https://example.com/source" }],
        }}
      />,
    );

    expect(screen.getByLabelText("Primary Source Name")).toHaveValue("Primary source");
    expect(screen.getByLabelText("Primary Source URL")).toHaveValue("https://example.com/source");
  });
});
